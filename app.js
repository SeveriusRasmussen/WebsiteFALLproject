// (ESM)
import express from "express";
import path from "path";
import fs from "fs"; // Til brug i addStaticRoutes function
import { fileURLToPath } from "url";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();
const app = express();

// __dirname i ESM: (to måder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 


// statiske filer via express (dårligt, brug smarte metoden nedunder)
app.use(express.static(path.join(__dirname, "public")));

// EJS Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


// Forside Route: list all .md
app.get("/", (_req, res) => {
    const dir = path.join(__dirname, "docs-md");
    const files = fs.readdirSync(dir)
        .filter(f => f.endsWith(".md"))
        .map(f => f.replace(/\.md$/, ""));
    res.render("layout", { 
        title: "Docs",
        body: `
            <h1>Documentation</h1>
            <ul>
                ${files.map(slug => `<li><a href="/docs-md/${slug}">${slug}</a></li>`).join("")}
            </ul>
        `
    });
});

// Route: vis ét markdown-dokument
app.get("/docs-md/:slug", (req, res, next) => {
    const { slug } = req.params;
    if (!/^[a-z0-9_-]+$/i.test(slug)) {
        return res.status(400).render("layout", { title: "Bad request", body: "<p>Invalid slug</p>" });
    }

    const full = path.join(__dirname, "docs-md", `${slug}.md`);
    if (!fs.existsSync(full)) {
        return res.status(404).render("layout", { title: "Not found", body: `<p>Missing document: ${slug}.md</p>` });
    }

    const raw  = fs.readFileSync(full, "utf8");
    const html = md.render(raw);
    return res.render("doc", { title: slug, content: html });
});

// Simple 404:
//app.use((_req, res) => res.status(404).render("layout", { title: "Not found", body: "<p>Not found</p>" }));

export default app;
// TEST GITHUB OG VERCEL
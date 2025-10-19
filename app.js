// (ESM)
import express from "express";
import path from "path";
import fs from 'fs'; // Til brug i addStaticRoutes function
import { fileURLToPath } from "url";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();
const app = express();

// __dirname i ESM: (to måder)
//const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url)); 


// statiske filer via express (dårligt, brug smarte metoden nedunder)
app.use(express.static(path.join(__dirname, "public")));

// EJS Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Helper: læs md-fil (throw hvis ikke findes)
/*
function readMarkdown(slug) {
    // Tillad kun a-zz0-9-_
    if (!/^[a-z0-9_-]+$/i.test(slug)) throw new Error("Invalid slug");
  const full = path.join(__dirname, "docs-md", `${slug}.md`);
  return fs.readFileSync(full, "utf8");
}
  */

// Forside Route: liste over dokumenter (læst fra docs-md)
app.get("/", (_req, res) => {
    const dir = path.join(__dirname, "docs-md");
    const files = fs.readdirSync(dir)
        .filter(f => f.endsWith(".md"))
        .map(f => f.replace(/\.md$/, ""));
    res.render("layout", { 
        title: "Docs",
        body: `
            <h1>Documentation:</h1>
            <ul>
                ${files.map(slug => `<li><a href="/docs/${slug}">${slug}</a></li>`).join("")}
            </ul>
        `
    });
});

// Route: vis ét markdown-dokument
app.get("/docs/:slug", (req, res, next) => {
    try {
        const { slug } = req.params;
        if (!/^[a-z0-9_-]+$/i.test(slug)) throw new Error("Invalid slug");
        const full = path.join(__dirname, "docs-md", `${slug}.md`);
        const raw = fs.readFileSync(full, "utf8");
        const html = md.render(raw);
        res.render("doc", { title: slug, content: html });
    } catch (err) {
        next(err);
    }
});

// Simple 404:
app.use((_req, res) => res.status(404).render("layout", { title: "Not found", body: "<p>Not found</p>" }));

export default app;
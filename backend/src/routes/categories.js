import { Router } from "express";

const router = Router();

const CATEGORIES = [
  { slug: "nouveautes", name: "Nouveautés" },
  { slug: "robes", name: "Robes" },
  { slug: "abaya", name: "Abaya" },
  { slug: "sacs", name: "Sacs" },
  { slug: "chaussures", name: "Chaussures" },
];

router.get("/", (_req, res) => {
  return res.json({ ok: true, categories: CATEGORIES });
});

export default router;

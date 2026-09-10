import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Sprint 7 Vercel Deployment, Robots.txt & Security Hardening Suite', () => {
  const rootDir = path.resolve(__dirname, '../../');

  describe('1. Robots.txt Crawler Directives', () => {
    const robotsPath = path.join(rootDir, 'public/robots.txt');

    it('verifies that public/robots.txt exists on disk', () => {
      expect(fs.existsSync(robotsPath)).toBe(true);
    });

    it('contains standard search engine crawler directives and sitemap linkage', () => {
      const robotsContent = fs.readFileSync(robotsPath, 'utf-8');

      expect(robotsContent).toContain('User-agent: *');
      expect(robotsContent).toContain('Allow: /');
      expect(robotsContent).toContain('Disallow: /api/');
      expect(robotsContent).toContain('Disallow: /admin/');
      expect(robotsContent).toContain('Disallow: /auth/');
      expect(robotsContent).toContain('Host: https://wavyassets.com');
      expect(robotsContent).toContain('Sitemap: https://wavyassets.com/sitemap.xml');
    });
  });

  describe('2. Sitemap.xml Specification', () => {
    const sitemapPath = path.join(rootDir, 'public/sitemap.xml');

    it('verifies that public/sitemap.xml exists and is valid XML structure', () => {
      expect(fs.existsSync(sitemapPath)).toBe(true);
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
      expect(sitemapContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemapContent).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(sitemapContent).toContain('</urlset>');
    });

    it('indexes core landing page and institutional asset vertical anchors', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
      expect(sitemapContent).toContain('<loc>https://wavyassets.com/</loc>');
      expect(sitemapContent).toContain('<loc>https://wavyassets.com/#services</loc>');
      expect(sitemapContent).toContain('<loc>https://wavyassets.com/#about</loc>');
      expect(sitemapContent).toContain('<loc>https://wavyassets.com/#trust</loc>');
      expect(sitemapContent).toContain('<loc>https://wavyassets.com/#simulator</loc>');
      expect(sitemapContent).toContain('<loc>https://wavyassets.com/#contact</loc>');
    });
  });

  describe('3. Vercel Configuration & Security Headers (vercel.json)', () => {
    const vercelPath = path.join(rootDir, 'vercel.json');

    it('verifies vercel.json exists and parses as valid JSON', () => {
      expect(fs.existsSync(vercelPath)).toBe(true);
      const raw = fs.readFileSync(vercelPath, 'utf-8');
      expect(() => JSON.parse(raw)).not.toThrow();
    });

    it('enforces SPA client-side routing rewrites for deep-links and custom 404', () => {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
      expect(vercelConfig.cleanUrls).toBe(true);
      expect(Array.isArray(vercelConfig.rewrites)).toBe(true);

      const catchAllRewrite = vercelConfig.rewrites.find(
        (r: { source: string; destination: string }) => r.source === '/(.*)'
      );
      expect(catchAllRewrite).toBeDefined();
      expect(catchAllRewrite?.destination).toBe('/index.html');
    });

    it('enforces strict Content-Security-Policy prohibiting unsafe-eval and unauthorized injection', () => {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
      expect(Array.isArray(vercelConfig.headers)).toBe(true);

      const globalHeaderEntry = vercelConfig.headers.find(
        (h: { source: string }) => h.source === '/(.*)'
      );
      expect(globalHeaderEntry).toBeDefined();

      const headersList = globalHeaderEntry.headers;
      const cspHeader = headersList.find(
        (h: { key: string }) => h.key === 'Content-Security-Policy'
      );
      expect(cspHeader).toBeDefined();
      const cspVal = cspHeader.value;

      // Strict CSP assertions
      expect(cspVal).not.toContain("'unsafe-eval'");
      expect(cspVal).toContain("script-src 'self'");
      expect(cspVal).toContain("default-src 'self'");
      expect(cspVal).toContain("frame-ancestors 'none'");
      expect(cspVal).toContain('https://fonts.googleapis.com');
      expect(cspVal).toContain('https://fonts.gstatic.com');

      // Security hardening headers
      const xFrame = headersList.find((h: { key: string }) => h.key === 'X-Frame-Options');
      expect(xFrame?.value).toBe('DENY');

      const nosniff = headersList.find((h: { key: string }) => h.key === 'X-Content-Type-Options');
      expect(nosniff?.value).toBe('nosniff');

      const hsts = headersList.find((h: { key: string }) => h.key === 'Strict-Transport-Security');
      expect(hsts?.value).toContain('max-age=63072000');
    });

    it('configures immutable long-term caching for hashed static assets', () => {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
      const assetHeaderEntry = vercelConfig.headers.find(
        (h: { source: string }) => h.source === '/assets/(.*)'
      );
      expect(assetHeaderEntry).toBeDefined();

      const cacheControl = assetHeaderEntry.headers.find(
        (h: { key: string }) => h.key === 'Cache-Control'
      );
      expect(cacheControl?.value).toBe('public, max-age=31536000, immutable');
    });
  });

  describe('4. Vite Rollup Manual Chunks Configuration', () => {
    const viteConfigPath = path.join(rootDir, 'vite.config.ts');

    it('configures manualChunks for vendor code splitting to prevent monolithic bundles', () => {
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8');
      expect(viteConfigContent).toContain('manualChunks(id)');
      expect(viteConfigContent).toContain('three-vendor');
      expect(viteConfigContent).toContain('motion-vendor');
      expect(viteConfigContent).toContain('radix-vendor');
      expect(viteConfigContent).toContain('react-vendor');
    });
  });
});

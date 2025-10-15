/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://ishanparihar.netlify.app",
  generateRobotsTxt: true,
  outDir: "out",
};

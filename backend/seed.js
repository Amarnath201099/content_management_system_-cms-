const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/user.model");
const Content = require("./models/content.model");

// Load environment variables from .env file
dotenv.config();

const seedDatabase = async () => {
  try {
    // 1. Establish MongoDB Connection
    await connectDB();

    console.log("====================================================");
    console.log("FLUSHING EXISTING DATABASE COLLECTIONS...");
    console.log("====================================================");
    await User.deleteMany({});
    await Content.deleteMany({});
    console.log("[-] User and Content collections cleared cleanly.");

    // 2. Provision RBAC Team Accounts
    console.log("\n====================================================");
    console.log("PROVISIONING RBAC TEAM ACCOUNTS...");
    console.log("====================================================");

    const adminUser = await User.create({
      name: "System Administrator",
      email: "admin@test.com",
      password: "Admin@123",
      role: "admin",
    });
    console.log(
      `[+] Admin created:  ${adminUser.email} (ID: ${adminUser._id})`,
    );

    const editorUser = await User.create({
      name: "Lead Marketing Editor",
      email: "editor@test.com",
      password: "Editor@123",
      role: "editor",
    });
    console.log(
      `[+] Editor created: ${editorUser.email} (ID: ${editorUser._id})`,
    );

    // 3. Seed Published SaaS Marketing Pages
    console.log("\n====================================================");
    console.log("SEEDING COMMERCIAL SAAS MARKETING PAGES...");
    console.log("====================================================");

    // -------------------------------------------------------------------------
    // PAGE 1: ROOT STANDALONE PAGE ("Platform Overview")
    // -------------------------------------------------------------------------
    const page1 = await Content.create({
      title: "Next-Generation Headless Content Management",
      slug: "overview",
      navLabel: "Overview",
      navOrder: 1,
      parent: null,
      author: adminUser._id,
      authorName: adminUser.name,
      assignedEditors: [editorUser._id],
      isPublished: true,
      sections: [
        {
          id: `slice-img-${Date.now()}-1`,
          type: "image-content",
          data: {
            title: "Empower Content Teams, Liberate Developers",
            heading: "Empower Content Teams, Liberate Developers",
            text: "Our decoupled architecture gives marketing teams complete publishing autonomy through visual modular blocks while developers retain strict control over codebases and design systems.",
            textContent:
              "Our decoupled architecture gives marketing teams complete publishing autonomy through visual modular blocks while developers retain strict control over codebases and design systems.",
            imageUrl:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
            alt: "Content marketing team collaborating on digital architecture",
            alignment: "image-left",
          },
        },
        {
          id: `slice-rich-${Date.now()}-2`,
          type: "rich-text",
          data: {
            blocks: [
              {
                id: "hdr-101",
                type: "header",
                data: {
                  text: "Eliminate Code-Freeze Bottlenecks Forever",
                  level: 2,
                },
              },
              {
                id: "prg-101",
                type: "paragraph",
                data: {
                  text: "Traditional monolithic CMS platforms trap organizations in endless development cycles where even minor copy updates require engineering tickets and production rebuilds. DevForge replaces rigid templates with atomic, schema-validated JSON content slices.",
                },
              },
              {
                id: "lst-101",
                type: "list",
                data: {
                  style: "unordered",
                  items: [
                    "Zero-latency editorial publishing without triggering Git deployment pipelines",
                    "Framework-agnostic REST and GraphQL APIs compatible with Next.js, React, and Vue",
                    "Strict JSON schema validation guaranteeing frontend UI stability",
                    "Enterprise-grade SEO management with automated metadata scrubbing",
                  ],
                },
              },
            ],
          },
        },
        {
          id: `slice-tbl-${Date.now()}-3`,
          type: "table",
          data: {
            withHeadings: true,
            headers: [
              "Performance Metric",
              "Legacy Monolith CMS",
              "Standard Headless CMS",
              "Our Modular CMS",
            ],
            rows: [
              [
                "Page Load Speed",
                "800ms - 2.5s (Sluggish)",
                "150ms - 400ms (Average)",
                "< 45ms (Edge Optimized)",
              ],
              [
                "Editorial Ease of Use",
                "Rigid & Clunky UI",
                "Abstract JSON Forms",
                "Visual No-Code Slices",
              ],
              [
                "Engineering Maintenance",
                "Heavy Plugin Bloat",
                "Custom API Glue Code",
                "Zero Maintenance Serverless",
              ],
              [
                "Security Vulnerabilities",
                "High (Database Exposure)",
                "Low (API Scoped)",
                "Zero-Trust RBAC Governance",
              ],
            ],
            content: [
              [
                "Performance Metric",
                "Legacy Monolith CMS",
                "Standard Headless CMS",
                "Our Modular CMS",
              ],
              [
                "Page Load Speed",
                "800ms - 2.5s (Sluggish)",
                "150ms - 400ms (Average)",
                "< 45ms (Edge Optimized)",
              ],
              [
                "Editorial Ease of Use",
                "Rigid & Clunky UI",
                "Abstract JSON Forms",
                "Visual No-Code Slices",
              ],
              [
                "Engineering Maintenance",
                "Heavy Plugin Bloat",
                "Custom API Glue Code",
                "Zero Maintenance Serverless",
              ],
              [
                "Security Vulnerabilities",
                "High (Database Exposure)",
                "Low (API Scoped)",
                "Zero-Trust RBAC Governance",
              ],
            ],
          },
        },
        {
          id: `slice-callout-${Date.now()}-4`,
          type: "callout-box",
          data: {
            style: "success",
            title: "Instant Live Updates",
            text: "All content changes reflect instantly via Redux caching and ISR revalidation without requiring engineering intervention or rebuilds.",
          },
        },
        {
          id: `slice-cta-${Date.now()}-5`,
          type: "cta-button",
          data: {
            label: "Explore Core Solutions",
            link: "/solutions",
            url: "/solutions",
            style: "primary",
          },
        },
        {
          id: `slice-math-${Date.now()}-6`,
          type: "math",
          data: {
            formula:
              "\\text{Latency} = T_{\\text{query}} + T_{\\text{cache}} < 45\\text{ms}",
            displayMode: true,
            description:
              "Algorithmic proof of our sub-50 millisecond API delivery target across global CDN edge networks.",
          },
        },
        {
          id: `slice-file-${Date.now()}-7`,
          type: "file-download",
          data: {
            label: "Download Enterprise Architecture Spec (PDF)",
            description:
              "Comprehensive technical breakdown of our JWT security and MongoDB schema.",
            fileUrl:
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          },
        },
      ],
    });
    console.log(`[+] Root Page 1: "${page1.title}" (/docs/${page1.slug})`);

    // -------------------------------------------------------------------------
    // PAGE 2: PARENT NAVIGATION PAGE ("Enterprise Solutions")
    // -------------------------------------------------------------------------
    const page2 = await Content.create({
      title: "Decoupled Architecture & Cloud Solutions",
      slug: "solutions",
      navLabel: "Solutions",
      navOrder: 2,
      parent: null,
      author: adminUser._id,
      authorName: adminUser.name,
      assignedEditors: [editorUser._id],
      isPublished: true,
      sections: [
        {
          id: `slice-img-${Date.now()}-201`,
          type: "image-content",
          data: {
            title: "High-Velocity REST API Delivery",
            heading: "High-Velocity REST API Delivery",
            text: "Distribute mission-critical content across web apps, mobile clients, and IoT devices simultaneously. Our stateless microservices architecture guarantees automated horizontal scaling during high-traffic enterprise events.",
            textContent:
              "Distribute mission-critical content across web apps, mobile clients, and IoT devices simultaneously. Our stateless microservices architecture guarantees automated horizontal scaling during high-traffic enterprise events.",
            imageUrl:
              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
            alt: "Cloud server analytics dashboard and API telemetry",
            alignment: "image-right",
          },
        },
        {
          id: `slice-callout-${Date.now()}-202`,
          type: "callout-box",
          data: {
            style: "warning",
            title: "Strict RBAC Governance & Audit Trails",
            text: "Enterprise security is built directly into the core. Granular Role-Based Access Control (RBAC) ensures marketing editors only modify assigned slices, preventing unauthorized production changes and protecting database integrity.",
          },
        },
        {
          id: `slice-rich-${Date.now()}-203`,
          type: "rich-text",
          data: {
            blocks: [
              {
                id: "hdr-201",
                type: "header",
                data: {
                  text: "Architected for Zero-Downtime Scale",
                  level: 2,
                },
              },
              {
                id: "prg-201",
                type: "paragraph",
                data: {
                  text: "By decoupling content storage from presentation rendering, DevForge insulates your digital ecosystem against traffic spikes and server outages. Whether deploying to Vercel, AWS, or custom Docker swarms, our infrastructure adapts effortlessly.",
                },
              },
              {
                id: "lst-201",
                type: "list",
                data: {
                  style: "unordered",
                  items: [
                    "Multi-region MongoDB Atlas cluster replication with automated failover",
                    "HTTP-Only JWT authentication tokens with strict XSS and CSRF defense",
                    "Automated webhook dispatching for CI/CD deployment integrations",
                    "Complete SOC2 Type II and GDPR compliance data structures",
                  ],
                },
              },
            ],
          },
        },
        {
          id: `slice-tbl-${Date.now()}-204`,
          type: "table",
          data: {
            withHeadings: true,
            headers: [
              "Enterprise Tier Feature",
              "Standard SLA",
              "Dedicated Cloud SLA",
              "Custom Enterprise SLA",
            ],
            rows: [
              [
                "Guaranteed Uptime",
                "99.9% Monthly",
                "99.95% Monthly",
                "99.99% Guaranteed",
              ],
              [
                "API Request Rate Limit",
                "50,000 req / min",
                "250,000 req / min",
                "Unlimited / Custom Edge",
              ],
              [
                "Global Edge Caching",
                "Standard Cloudflare",
                "Enterprise CDN Routing",
                "Dedicated Multi-CDN Swarm",
              ],
              [
                "Support Response Time",
                "< 12 Hours (Email)",
                "< 2 Hours (Priority)",
                "< 15 Minutes (24/7 Phone)",
              ],
            ],
            content: [
              [
                "Enterprise Tier Feature",
                "Standard SLA",
                "Dedicated Cloud SLA",
                "Custom Enterprise SLA",
              ],
              [
                "Guaranteed Uptime",
                "99.9% Monthly",
                "99.95% Monthly",
                "99.99% Guaranteed",
              ],
              [
                "API Request Rate Limit",
                "50,000 req / min",
                "250,000 req / min",
                "Unlimited / Custom Edge",
              ],
              [
                "Global Edge Caching",
                "Standard Cloudflare",
                "Enterprise CDN Routing",
                "Dedicated Multi-CDN Swarm",
              ],
              [
                "Support Response Time",
                "< 12 Hours (Email)",
                "< 2 Hours (Priority)",
                "< 15 Minutes (24/7 Phone)",
              ],
            ],
          },
        },
        {
          id: `slice-math-${Date.now()}-205`,
          type: "math",
          data: {
            formula:
              "\\text{Throughput} = \\frac{\\text{Requests}}{\\text{Sec}} \\ge 10,000 \\text{ RPS}",
            displayMode: true,
            description:
              "Load balancing capacity benchmark across our distributed serverless microservices cluster.",
          },
        },
        {
          id: `slice-file-${Date.now()}-206`,
          type: "file-download",
          data: {
            label: "Download Cloud Security & Compliance Whitepaper (PDF)",
            description:
              "Detailed overview of our encryption at rest, DDoS mitigation protocols, and audit logging.",
            fileUrl:
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          },
        },
        {
          id: `slice-cta-${Date.now()}-207`,
          type: "cta-button",
          data: {
            label: "See the Visual Page Builder in Action",
            link: "/solutions/page-builder",
            url: "/solutions/page-builder",
            style: "primary",
          },
        },
      ],
    });
    console.log(`[+] Parent Page 2: "${page2.title}" (/docs/${page2.slug})`);

    // -------------------------------------------------------------------------
    // PAGE 3: CHILD NAVIGATION PAGE ("Modular Page Builder")
    // -------------------------------------------------------------------------
    const page3 = await Content.create({
      title: "No-Code Visual Page Builder",
      slug: "solutions/page-builder",
      navLabel: "Page Builder",
      navOrder: 1,
      parent: page2._id, // References Page 2 as parent ObjectId
      author: editorUser._id,
      authorName: editorUser.name,
      assignedEditors: [editorUser._id],
      isPublished: true,
      sections: [
        {
          id: `slice-img-${Date.now()}-301`,
          type: "image-content",
          data: {
            title: "",
            heading: "",
            text: "",
            textContent: "",
            imageUrl:
              "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1400&q=80",
            alt: "Full-width visual page builder workspace interface",
            alignment: "image-left",
          },
        },
        {
          id: `slice-rich-${Date.now()}-302`,
          type: "rich-text",
          data: {
            blocks: [
              {
                id: "hdr-301",
                type: "header",
                data: {
                  text: "7 Atomic Slices for Infinite Editorial Creativity",
                  level: 2,
                },
              },
              {
                id: "prg-301",
                type: "paragraph",
                data: {
                  text: "Why compromise between developer flexibility and editorial freedom? Our visual Page Builder equips content creators with seven standardized, schema-validated building blocks that assemble into rich, responsive digital experiences without writing a single line of code.",
                },
              },
              {
                id: "lst-301",
                type: "list",
                data: {
                  style: "unordered",
                  items: [
                    "Rich Text Slice: Dynamic Editor.js typography, headings, and nested bullet structures",
                    "Image + Content Slice: Responsive visual banners with smart full-width hero layout detection",
                    "Table Matrix Slice: Interactive data spreadsheets with real-time row and column injection",
                    "KaTeX Math Slice: Native algorithmic LaTeX rendering for STEM and technical documentations",
                    "Callout Box Slice: Color-coded alert notices for critical warnings, info, and success SLAs",
                    "File Download CTA Slice: Trackable document attachment buttons with descriptive legends",
                    "CTA Button Slice: High-converting routing links with primary and dark outline styles",
                  ],
                },
              },
            ],
          },
        },
        {
          id: `slice-math-${Date.now()}-303`,
          type: "math",
          data: {
            formula:
              "\\text{Efficiency Gain} = \\sum_{i=1}^{n} (\\text{Dev Hours}_i \\times 85\\%)",
            displayMode: true,
            description:
              "Quantifiable engineering time saved by delegating landing page construction directly to marketing editors.",
          },
        },
        {
          id: `slice-callout-${Date.now()}-304`,
          type: "callout-box",
          data: {
            style: "info",
            title: "No Schema Breakages Guaranteed",
            text: "Every visual block is strictly validated against Mongoose enum whitelists before saving. Editors can experiment freely with complex page structures knowing that backend data integrity is 100% protected.",
          },
        },
        {
          id: `slice-tbl-${Date.now()}-305`,
          type: "table",
          data: {
            withHeadings: true,
            headers: [
              "Modular Slice Type",
              "Editorial Capability",
              "Frontend Rendering Behavior",
            ],
            rows: [
              [
                "Rich Text Editor",
                "Visual formatting & list hierarchy",
                "Clean semantic HTML5 tags via Tailwind prose",
              ],
              [
                "Image + Content",
                "Media positioning & hero toggling",
                "Responsive Flexbox grid or full-width banner",
              ],
              [
                "Table Spreadsheet",
                "Dynamic grid matrix manipulation",
                "Accessible tabular data spreadsheet",
              ],
              [
                "KaTeX Math Formula",
                "LaTeX algorithmic expression input",
                "Server-safe mathematical equations",
              ],
              [
                "Callout Alert Box",
                "Selectable notice styling (Info/Warn)",
                "Color-coded Tailwind CSS alert card",
              ],
            ],
            content: [
              [
                "Modular Slice Type",
                "Editorial Capability",
                "Frontend Rendering Behavior",
              ],
              [
                "Rich Text Editor",
                "Visual formatting & list hierarchy",
                "Clean semantic HTML5 tags via Tailwind prose",
              ],
              [
                "Image + Content",
                "Media positioning & hero toggling",
                "Responsive Flexbox grid or full-width banner",
              ],
              [
                "Table Spreadsheet",
                "Dynamic grid matrix manipulation",
                "Accessible tabular data spreadsheet",
              ],
              [
                "KaTeX Math Formula",
                "LaTeX algorithmic expression input",
                "Server-safe mathematical equations",
              ],
              [
                "Callout Alert Box",
                "Selectable notice styling (Info/Warn)",
                "Color-coded Tailwind CSS alert card",
              ],
            ],
          },
        },
        {
          id: `slice-file-${Date.now()}-306`,
          type: "file-download",
          data: {
            label: "Download Page Builder User Guide & Slice Reference (PDF)",
            description:
              "Complete editorial handbook detailing block configurations, keyboard shortcuts, and SEO best practices.",
            fileUrl:
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          },
        },
        {
          id: `slice-cta-${Date.now()}-307`,
          type: "cta-button",
          data: {
            label: "Request a Custom Sandbox Environment",
            link: "/overview",
            url: "/overview",
            style: "primary",
          },
        },
      ],
    });
    console.log(`[+] Child Page 3:  "${page3.title}" (/docs/${page3.slug})`);
    console.log(`    └── Nested cleanly under Parent ID: ${page2._id}`);

    console.log("\n====================================================");
    console.log("DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("====================================================");
    console.log("You can now start your server and explore:");
    console.log("1. Public Site:  http://localhost:3000/overview");
    console.log("2. Parent Page:  http://localhost:3000/solutions");
    console.log(
      "3. Child Page:   http://localhost:3000/solutions/page-builder",
    );
    console.log(
      "4. Admin Portal: http://localhost:3000/admin/login (admin@test.com / password123)",
    );
    console.log("====================================================\n");

    process.exit(0);
  } catch (error) {
    console.error(`\n[!] FATAL SEEDING ERROR: ${error.message}`);
    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        console.error(
          `    - Schema Validation Failure on [${key}]: ${error.errors[key].message}`,
        );
      });
    }
    process.exit(1);
  }
};

// Execute script
seedDatabase();

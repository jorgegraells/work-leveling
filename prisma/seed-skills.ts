import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Soft-skill slugs to remove (these are Attributes, not Skills)
const REMOVE_SLUGS = [
  "leadership", "communication", "strategy", "negotiation",
  "data-analysis", "project-management",
]

const SKILLS = [
  // Ofimática / Office Suite
  { name: "Microsoft Word",                slug: "microsoft-word",        category: "Ofimática / Office Suite",         icon: "description",              color: "tertiary" },
  { name: "Microsoft Excel",               slug: "microsoft-excel",       category: "Ofimática / Office Suite",         icon: "table_chart",              color: "secondary" },
  { name: "Microsoft PowerPoint",          slug: "microsoft-powerpoint",  category: "Ofimática / Office Suite",         icon: "slideshow",                color: "primary" },
  { name: "Microsoft Outlook",             slug: "microsoft-outlook",     category: "Ofimática / Office Suite",         icon: "mail",                     color: "tertiary" },
  { name: "Microsoft Teams",               slug: "microsoft-teams",       category: "Ofimática / Office Suite",         icon: "groups",                   color: "tertiary" },
  { name: "SharePoint",                    slug: "sharepoint",            category: "Ofimática / Office Suite",         icon: "folder_shared",            color: "tertiary" },
  { name: "Microsoft Access",              slug: "microsoft-access",      category: "Ofimática / Office Suite",         icon: "storage",                  color: "outline" },
  { name: "OneNote",                       slug: "onenote",               category: "Ofimática / Office Suite",         icon: "edit_note",                color: "tertiary" },
  { name: "Microsoft Visio",               slug: "microsoft-visio",       category: "Ofimática / Office Suite",         icon: "account_tree",             color: "outline" },
  { name: "Microsoft Project",             slug: "microsoft-project",     category: "Ofimática / Office Suite",         icon: "calendar_view_month",      color: "tertiary" },
  { name: "Google Docs",                   slug: "google-docs",           category: "Ofimática / Office Suite",         icon: "description",              color: "secondary" },
  { name: "Google Sheets",                 slug: "google-sheets",         category: "Ofimática / Office Suite",         icon: "table_chart",              color: "secondary" },
  { name: "Google Slides",                 slug: "google-slides",         category: "Ofimática / Office Suite",         icon: "slideshow",                color: "secondary" },
  { name: "Google Drive",                  slug: "google-drive",          category: "Ofimática / Office Suite",         icon: "cloud",                    color: "secondary" },
  { name: "Gmail",                         slug: "gmail",                 category: "Ofimática / Office Suite",         icon: "mail",                     color: "secondary" },
  { name: "Google Meet",                   slug: "google-meet",           category: "Ofimática / Office Suite",         icon: "videocam",                 color: "secondary" },
  { name: "LibreOffice",                   slug: "libreoffice",           category: "Ofimática / Office Suite",         icon: "open_in_new",              color: "outline" },

  // ERP / Gestión empresarial
  { name: "SAP FI",                        slug: "sap-fi",                category: "ERP / Gestión empresarial",        icon: "account_balance",          color: "primary" },
  { name: "SAP MM",                        slug: "sap-mm",                category: "ERP / Gestión empresarial",        icon: "inventory_2",              color: "primary" },
  { name: "SAP HR",                        slug: "sap-hr",                category: "ERP / Gestión empresarial",        icon: "badge",                    color: "primary" },
  { name: "SAP SD",                        slug: "sap-sd",                category: "ERP / Gestión empresarial",        icon: "local_shipping",           color: "primary" },
  { name: "SAP BW",                        slug: "sap-bw",                category: "ERP / Gestión empresarial",        icon: "analytics",                color: "primary" },
  { name: "Sage 50",                       slug: "sage-50",               category: "ERP / Gestión empresarial",        icon: "receipt_long",             color: "secondary" },
  { name: "Sage 200",                      slug: "sage-200",              category: "ERP / Gestión empresarial",        icon: "receipt_long",             color: "secondary" },
  { name: "Sage X3",                       slug: "sage-x3",               category: "ERP / Gestión empresarial",        icon: "receipt_long",             color: "secondary" },
  { name: "Sage Contaplus",                slug: "sage-contaplus",        category: "ERP / Gestión empresarial",        icon: "calculate",                color: "secondary" },
  { name: "Sage Nóminas",                  slug: "sage-nominas",          category: "ERP / Gestión empresarial",        icon: "payments",                 color: "secondary" },
  { name: "Microsoft Dynamics 365",        slug: "dynamics-365",          category: "ERP / Gestión empresarial",        icon: "cloud_sync",               color: "tertiary" },
  { name: "Dynamics NAV / Business Central", slug: "dynamics-nav-bc",     category: "ERP / Gestión empresarial",        icon: "storefront",               color: "tertiary" },
  { name: "Microsoft Dynamics AX",         slug: "dynamics-ax",           category: "ERP / Gestión empresarial",        icon: "inventory",                color: "tertiary" },
  { name: "Odoo",                          slug: "odoo",                  category: "ERP / Gestión empresarial",        icon: "widgets",                  color: "primary" },
  { name: "Holded",                        slug: "holded",                category: "ERP / Gestión empresarial",        icon: "business_center",          color: "outline" },
  { name: "A3 Software",                   slug: "a3-software",           category: "ERP / Gestión empresarial",        icon: "manage_accounts",          color: "outline" },
  { name: "ContaPlus",                     slug: "contaplus",             category: "ERP / Gestión empresarial",        icon: "calculate",                color: "outline" },
  { name: "FacturaPlus",                   slug: "facturaplus",           category: "ERP / Gestión empresarial",        icon: "request_quote",            color: "outline" },
  { name: "NominaPlus",                    slug: "nominaplus",            category: "ERP / Gestión empresarial",        icon: "payments",                 color: "outline" },
  { name: "Oracle ERP",                    slug: "oracle-erp",            category: "ERP / Gestión empresarial",        icon: "corporate_fare",           color: "outline" },
  { name: "NetSuite",                      slug: "netsuite",              category: "ERP / Gestión empresarial",        icon: "cloud_done",               color: "outline" },

  // CRM
  { name: "Salesforce",                    slug: "salesforce",            category: "CRM",                              icon: "cloud",                    color: "tertiary" },
  { name: "HubSpot CRM",                   slug: "hubspot-crm",           category: "CRM",                              icon: "contacts",                 color: "secondary" },
  { name: "Zoho CRM",                      slug: "zoho-crm",              category: "CRM",                              icon: "people",                   color: "primary" },
  { name: "Microsoft Dynamics CRM",        slug: "dynamics-crm",          category: "CRM",                              icon: "supervisor_account",       color: "tertiary" },
  { name: "Pipedrive",                     slug: "pipedrive",             category: "CRM",                              icon: "filter_alt",               color: "secondary" },
  { name: "SugarCRM",                      slug: "sugarcrm",              category: "CRM",                              icon: "bubble_chart",             color: "outline" },

  // Contabilidad / Finanzas
  { name: "QuickBooks",                    slug: "quickbooks",            category: "Contabilidad / Finanzas",          icon: "account_balance_wallet",   color: "secondary" },
  { name: "Xero",                          slug: "xero",                  category: "Contabilidad / Finanzas",          icon: "balance",                  color: "tertiary" },
  { name: "FreshBooks",                    slug: "freshbooks",            category: "Contabilidad / Finanzas",          icon: "receipt",                  color: "secondary" },
  { name: "DATEV",                         slug: "datev",                 category: "Contabilidad / Finanzas",          icon: "euro",                     color: "outline" },

  // Diseño gráfico
  { name: "Adobe Photoshop",               slug: "adobe-photoshop",       category: "Diseño gráfico",                   icon: "photo_camera",             color: "tertiary" },
  { name: "Adobe Illustrator",             slug: "adobe-illustrator",     category: "Diseño gráfico",                   icon: "gesture",                  color: "primary" },
  { name: "Adobe InDesign",                slug: "adobe-indesign",        category: "Diseño gráfico",                   icon: "menu_book",                color: "tertiary" },
  { name: "Adobe Premiere Pro",            slug: "adobe-premiere",        category: "Diseño gráfico",                   icon: "movie",                    color: "tertiary" },
  { name: "Adobe After Effects",           slug: "adobe-after-effects",   category: "Diseño gráfico",                   icon: "animation",                color: "tertiary" },
  { name: "Figma",                         slug: "figma",                 category: "Diseño gráfico",                   icon: "palette",                  color: "secondary" },
  { name: "Sketch",                        slug: "sketch",                category: "Diseño gráfico",                   icon: "draw",                     color: "primary" },
  { name: "Canva",                         slug: "canva",                 category: "Diseño gráfico",                   icon: "brush",                    color: "secondary" },
  { name: "CorelDRAW",                     slug: "coreldraw",             category: "Diseño gráfico",                   icon: "style",                    color: "outline" },
  { name: "Affinity Designer",             slug: "affinity-designer",     category: "Diseño gráfico",                   icon: "pentagon",                 color: "outline" },

  // Desarrollo / Programación
  { name: "Python",                        slug: "python",                category: "Desarrollo / Programación",        icon: "code",                     color: "secondary" },
  { name: "JavaScript",                    slug: "javascript",            category: "Desarrollo / Programación",        icon: "code",                     color: "primary" },
  { name: "TypeScript",                    slug: "typescript",            category: "Desarrollo / Programación",        icon: "code",                     color: "tertiary" },
  { name: "Java",                          slug: "java",                  category: "Desarrollo / Programación",        icon: "code",                     color: "secondary" },
  { name: "C++",                           slug: "cpp",                   category: "Desarrollo / Programación",        icon: "code",                     color: "tertiary" },
  { name: "C#",                            slug: "csharp",                category: "Desarrollo / Programación",        icon: "code",                     color: "tertiary" },
  { name: "C",                             slug: "c-lang",                category: "Desarrollo / Programación",        icon: "code",                     color: "outline" },
  { name: "PHP",                           slug: "php",                   category: "Desarrollo / Programación",        icon: "code",                     color: "tertiary" },
  { name: "Ruby",                          slug: "ruby",                  category: "Desarrollo / Programación",        icon: "code",                     color: "secondary" },
  { name: "Go",                            slug: "golang",                category: "Desarrollo / Programación",        icon: "code",                     color: "tertiary" },
  { name: "Rust",                          slug: "rust",                  category: "Desarrollo / Programación",        icon: "code",                     color: "primary" },
  { name: "Swift",                         slug: "swift",                 category: "Desarrollo / Programación",        icon: "code",                     color: "secondary" },
  { name: "Kotlin",                        slug: "kotlin",                category: "Desarrollo / Programación",        icon: "code",                     color: "tertiary" },
  { name: "R",                             slug: "r-lang",                category: "Desarrollo / Programación",        icon: "bar_chart",                color: "secondary" },
  { name: "MATLAB",                        slug: "matlab",                category: "Desarrollo / Programación",        icon: "functions",                color: "primary" },
  { name: "SQL",                           slug: "sql",                   category: "Desarrollo / Programación",        icon: "table_rows",               color: "tertiary" },
  { name: "Bash / Shell",                  slug: "bash",                  category: "Desarrollo / Programación",        icon: "terminal",                 color: "outline" },
  { name: "PowerShell",                    slug: "powershell",            category: "Desarrollo / Programación",        icon: "terminal",                 color: "tertiary" },
  { name: "VBA",                           slug: "vba",                   category: "Desarrollo / Programación",        icon: "integration_instructions", color: "secondary" },
  { name: "React",                         slug: "react",                 category: "Desarrollo / Programación",        icon: "hub",                      color: "tertiary" },
  { name: "Angular",                       slug: "angular",               category: "Desarrollo / Programación",        icon: "change_history",           color: "secondary" },
  { name: "Vue.js",                        slug: "vuejs",                 category: "Desarrollo / Programación",        icon: "layers",                   color: "secondary" },
  { name: "Next.js",                       slug: "nextjs",                category: "Desarrollo / Programación",        icon: "rocket_launch",            color: "outline" },
  { name: "Node.js",                       slug: "nodejs",                category: "Desarrollo / Programación",        icon: "dns",                      color: "secondary" },
  { name: "Django",                        slug: "django",                category: "Desarrollo / Programación",        icon: "web",                      color: "secondary" },
  { name: "Flask",                         slug: "flask",                 category: "Desarrollo / Programación",        icon: "web",                      color: "outline" },
  { name: "FastAPI",                       slug: "fastapi",               category: "Desarrollo / Programación",        icon: "api",                      color: "secondary" },
  { name: "Laravel",                       slug: "laravel",               category: "Desarrollo / Programación",        icon: "web",                      color: "secondary" },
  { name: "Spring Boot",                   slug: "spring-boot",           category: "Desarrollo / Programación",        icon: "web",                      color: "secondary" },
  { name: "ASP.NET",                       slug: "aspnet",                category: "Desarrollo / Programación",        icon: "web",                      color: "tertiary" },
  { name: "Ruby on Rails",                 slug: "ruby-on-rails",         category: "Desarrollo / Programación",        icon: "web",                      color: "secondary" },
  { name: "Svelte",                        slug: "svelte",                category: "Desarrollo / Programación",        icon: "web",                      color: "primary" },
  { name: "React Native",                  slug: "react-native",          category: "Desarrollo / Programación",        icon: "phone_android",            color: "tertiary" },
  { name: "Flutter",                       slug: "flutter",               category: "Desarrollo / Programación",        icon: "phone_android",            color: "tertiary" },
  { name: "Xamarin",                       slug: "xamarin",               category: "Desarrollo / Programación",        icon: "phone_android",            color: "tertiary" },
  { name: "WordPress",                     slug: "wordpress",             category: "Desarrollo / Programación",        icon: "article",                  color: "tertiary" },
  { name: "Drupal",                        slug: "drupal",                category: "Desarrollo / Programación",        icon: "article",                  color: "outline" },
  { name: "Shopify",                       slug: "shopify",               category: "Desarrollo / Programación",        icon: "shopping_bag",             color: "secondary" },

  // Bases de datos
  { name: "MySQL",                         slug: "mysql",                 category: "Bases de datos",                   icon: "database",                 color: "secondary" },
  { name: "PostgreSQL",                    slug: "postgresql",            category: "Bases de datos",                   icon: "database",                 color: "tertiary" },
  { name: "SQL Server",                    slug: "sql-server",            category: "Bases de datos",                   icon: "storage",                  color: "tertiary" },
  { name: "Oracle DB",                     slug: "oracle-db",             category: "Bases de datos",                   icon: "storage",                  color: "outline" },
  { name: "MongoDB",                       slug: "mongodb",               category: "Bases de datos",                   icon: "data_object",              color: "secondary" },
  { name: "Redis",                         slug: "redis",                 category: "Bases de datos",                   icon: "memory",                   color: "secondary" },
  { name: "Elasticsearch",                 slug: "elasticsearch",         category: "Bases de datos",                   icon: "manage_search",            color: "primary" },
  { name: "SQLite",                        slug: "sqlite",                category: "Bases de datos",                   icon: "database",                 color: "outline" },
  { name: "MariaDB",                       slug: "mariadb",               category: "Bases de datos",                   icon: "database",                 color: "outline" },
  { name: "Cassandra",                     slug: "cassandra",             category: "Bases de datos",                   icon: "hub",                      color: "outline" },
  { name: "Firebase",                      slug: "firebase",              category: "Bases de datos",                   icon: "local_fire_department",    color: "primary" },

  // Cloud / DevOps
  { name: "AWS",                           slug: "aws",                   category: "Cloud / DevOps",                   icon: "cloud",                    color: "primary" },
  { name: "Microsoft Azure",               slug: "azure",                 category: "Cloud / DevOps",                   icon: "cloud",                    color: "tertiary" },
  { name: "Google Cloud Platform",         slug: "gcp",                   category: "Cloud / DevOps",                   icon: "cloud",                    color: "secondary" },
  { name: "Docker",                        slug: "docker",                category: "Cloud / DevOps",                   icon: "deployed_code",            color: "tertiary" },
  { name: "Kubernetes",                    slug: "kubernetes",            category: "Cloud / DevOps",                   icon: "settings_applications",    color: "tertiary" },
  { name: "Terraform",                     slug: "terraform",             category: "Cloud / DevOps",                   icon: "construction",             color: "secondary" },
  { name: "Ansible",                       slug: "ansible",               category: "Cloud / DevOps",                   icon: "sync_alt",                 color: "outline" },
  { name: "Jenkins",                       slug: "jenkins",               category: "Cloud / DevOps",                   icon: "autorenew",                color: "outline" },
  { name: "GitLab CI",                     slug: "gitlab-ci",             category: "Cloud / DevOps",                   icon: "merge",                    color: "secondary" },
  { name: "GitHub Actions",                slug: "github-actions",        category: "Cloud / DevOps",                   icon: "play_circle",              color: "outline" },
  { name: "Linux",                         slug: "linux",                 category: "Cloud / DevOps",                   icon: "terminal",                 color: "primary" },
  { name: "Git",                           slug: "git",                   category: "Cloud / DevOps",                   icon: "fork_right",               color: "secondary" },
  { name: "Nginx",                         slug: "nginx",                 category: "Cloud / DevOps",                   icon: "router",                   color: "secondary" },

  // Ciberseguridad
  { name: "FortiGate / Fortinet",          slug: "fortinet",              category: "Ciberseguridad",                   icon: "security",                 color: "secondary" },
  { name: "Sophos",                        slug: "sophos",                category: "Ciberseguridad",                   icon: "shield",                   color: "tertiary" },
  { name: "ThreatLocker",                  slug: "threatlocker",          category: "Ciberseguridad",                   icon: "lock",                     color: "primary" },
  { name: "CrowdStrike",                   slug: "crowdstrike",           category: "Ciberseguridad",                   icon: "crisis_alert",             color: "secondary" },
  { name: "SentinelOne",                   slug: "sentinelone",           category: "Ciberseguridad",                   icon: "shield",                   color: "secondary" },
  { name: "Palo Alto Networks",            slug: "palo-alto",             category: "Ciberseguridad",                   icon: "security",                 color: "outline" },
  { name: "Check Point",                   slug: "checkpoint",            category: "Ciberseguridad",                   icon: "verified_user",            color: "outline" },
  { name: "Cisco ASA",                     slug: "cisco-asa",             category: "Ciberseguridad",                   icon: "router",                   color: "tertiary" },
  { name: "Cisco Umbrella",                slug: "cisco-umbrella",        category: "Ciberseguridad",                   icon: "umbrella",                 color: "tertiary" },
  { name: "Darktrace",                     slug: "darktrace",             category: "Ciberseguridad",                   icon: "radar",                    color: "secondary" },
  { name: "Tenable / Nessus",              slug: "nessus",                category: "Ciberseguridad",                   icon: "pest_control",             color: "outline" },
  { name: "Splunk",                        slug: "splunk",                category: "Ciberseguridad",                   icon: "query_stats",              color: "secondary" },
  { name: "IBM QRadar",                    slug: "qradar",                category: "Ciberseguridad",                   icon: "manage_search",            color: "outline" },
  { name: "Wireshark",                     slug: "wireshark",             category: "Ciberseguridad",                   icon: "network_check",            color: "tertiary" },
  { name: "Metasploit",                    slug: "metasploit",            category: "Ciberseguridad",                   icon: "bug_report",               color: "secondary" },
  { name: "Burp Suite",                    slug: "burp-suite",            category: "Ciberseguridad",                   icon: "search",                   color: "secondary" },
  { name: "Microsoft Defender",            slug: "ms-defender",           category: "Ciberseguridad",                   icon: "security",                 color: "tertiary" },
  { name: "Malwarebytes",                  slug: "malwarebytes",          category: "Ciberseguridad",                   icon: "shield",                   color: "secondary" },
  { name: "ESET",                          slug: "eset",                  category: "Ciberseguridad",                   icon: "verified_user",            color: "secondary" },
  { name: "Bitdefender",                   slug: "bitdefender",           category: "Ciberseguridad",                   icon: "security",                 color: "secondary" },
  { name: "Carbon Black",                  slug: "carbon-black",          category: "Ciberseguridad",                   icon: "shield",                   color: "outline" },
  { name: "CISSP",                         slug: "cissp",                 category: "Ciberseguridad",                   icon: "workspace_premium",        color: "primary" },
  { name: "CEH",                           slug: "ceh",                   category: "Ciberseguridad",                   icon: "workspace_premium",        color: "primary" },
  { name: "CompTIA Security+",             slug: "comptia-securityplus",  category: "Ciberseguridad",                   icon: "workspace_premium",        color: "primary" },
  { name: "CISM",                          slug: "cism",                  category: "Ciberseguridad",                   icon: "workspace_premium",        color: "primary" },

  // Redes e infraestructura
  { name: "Cisco CCNA",                    slug: "ccna",                  category: "Redes e infraestructura",          icon: "lan",                      color: "tertiary" },
  { name: "Cisco CCNP",                    slug: "ccnp",                  category: "Redes e infraestructura",          icon: "lan",                      color: "tertiary" },
  { name: "MikroTik",                      slug: "mikrotik",              category: "Redes e infraestructura",          icon: "router",                   color: "outline" },
  { name: "pfSense",                       slug: "pfsense",               category: "Redes e infraestructura",          icon: "shield",                   color: "outline" },
  { name: "VMware",                        slug: "vmware",                category: "Redes e infraestructura",          icon: "dns",                      color: "secondary" },
  { name: "Hyper-V",                       slug: "hyper-v",               category: "Redes e infraestructura",          icon: "developer_board",          color: "tertiary" },
  { name: "Active Directory",              slug: "active-directory",      category: "Redes e infraestructura",          icon: "manage_accounts",          color: "tertiary" },
  { name: "Azure Active Directory",        slug: "azure-ad",              category: "Redes e infraestructura",          icon: "cloud_sync",               color: "tertiary" },
  { name: "VoIP / Asterisk",              slug: "voip-asterisk",         category: "Redes e infraestructura",          icon: "call",                     color: "outline" },

  // BI / Análisis de datos
  { name: "Power BI",                      slug: "power-bi",              category: "BI / Análisis de datos",           icon: "bar_chart",                color: "primary" },
  { name: "Tableau",                       slug: "tableau",               category: "BI / Análisis de datos",           icon: "stacked_bar_chart",        color: "secondary" },
  { name: "Qlik",                          slug: "qlik",                  category: "BI / Análisis de datos",           icon: "donut_large",              color: "secondary" },
  { name: "Looker",                        slug: "looker",                category: "BI / Análisis de datos",           icon: "search_insights",          color: "outline" },
  { name: "Google Looker Studio",          slug: "looker-studio",         category: "BI / Análisis de datos",           icon: "insert_chart",             color: "secondary" },
  { name: "SPSS",                          slug: "spss",                  category: "BI / Análisis de datos",           icon: "scatter_plot",             color: "outline" },
  { name: "SAS",                           slug: "sas",                   category: "BI / Análisis de datos",           icon: "analytics",                color: "outline" },
  { name: "Alteryx",                       slug: "alteryx",               category: "BI / Análisis de datos",           icon: "schema",                   color: "outline" },

  // Project Management / Colaboración
  { name: "Jira",                          slug: "jira",                  category: "Project Management",               icon: "task_alt",                 color: "tertiary" },
  { name: "Confluence",                    slug: "confluence",            category: "Project Management",               icon: "article",                  color: "tertiary" },
  { name: "Trello",                        slug: "trello",                category: "Project Management",               icon: "view_kanban",              color: "tertiary" },
  { name: "Asana",                         slug: "asana",                 category: "Project Management",               icon: "checklist",                color: "secondary" },
  { name: "Monday.com",                    slug: "monday",                category: "Project Management",               icon: "calendar_view_week",       color: "secondary" },
  { name: "Notion",                        slug: "notion",                category: "Project Management",               icon: "sticky_note_2",            color: "outline" },
  { name: "ClickUp",                       slug: "clickup",               category: "Project Management",               icon: "rocket_launch",            color: "secondary" },
  { name: "MS Project",                    slug: "ms-project",            category: "Project Management",             icon: "calendar_view_month",      color: "tertiary" },
  { name: "Basecamp",                      slug: "basecamp",              category: "Project Management",               icon: "camping",                  color: "outline" },

  // RRHH / Nóminas
  { name: "Meta4",                         slug: "meta4",                 category: "RRHH / Nóminas",                   icon: "badge",                    color: "outline" },
  { name: "Workday",                       slug: "workday",               category: "RRHH / Nóminas",                   icon: "work",                     color: "tertiary" },
  { name: "BambooHR",                      slug: "bamboohr",              category: "RRHH / Nóminas",                   icon: "people",                   color: "secondary" },
  { name: "SAP SuccessFactors",            slug: "successfactors",        category: "RRHH / Nóminas",                   icon: "manage_accounts",          color: "primary" },
  { name: "Kronos",                        slug: "kronos",                category: "RRHH / Nóminas",                   icon: "schedule",                 color: "outline" },
  { name: "ADP",                           slug: "adp",                   category: "RRHH / Nóminas",                   icon: "payments",                 color: "outline" },

  // Marketing Digital
  { name: "Google Ads",                    slug: "google-ads",            category: "Marketing Digital",                icon: "campaign",                 color: "secondary" },
  { name: "Google Analytics",              slug: "google-analytics",      category: "Marketing Digital",                icon: "monitoring",               color: "secondary" },
  { name: "Meta Ads",                      slug: "meta-ads",              category: "Marketing Digital",                icon: "ads_click",                color: "tertiary" },
  { name: "SEMrush",                       slug: "semrush",               category: "Marketing Digital",                icon: "search",                   color: "secondary" },
  { name: "Ahrefs",                        slug: "ahrefs",                category: "Marketing Digital",                icon: "link",                     color: "outline" },
  { name: "Moz",                           slug: "moz",                   category: "Marketing Digital",                icon: "travel_explore",           color: "outline" },
  { name: "Mailchimp",                     slug: "mailchimp",             category: "Marketing Digital",                icon: "forward_to_inbox",         color: "secondary" },
  { name: "HubSpot Marketing",             slug: "hubspot-marketing",     category: "Marketing Digital",                icon: "hub",                      color: "secondary" },
  { name: "Hootsuite",                     slug: "hootsuite",             category: "Marketing Digital",                icon: "share",                    color: "outline" },
  { name: "Marketo",                       slug: "marketo",               category: "Marketing Digital",                icon: "electric_bolt",            color: "outline" },

  // CAD / Ingeniería
  { name: "AutoCAD",                       slug: "autocad",               category: "CAD / Ingeniería",                 icon: "architecture",             color: "secondary" },
  { name: "SolidWorks",                    slug: "solidworks",            category: "CAD / Ingeniería",                 icon: "view_in_ar",               color: "tertiary" },
  { name: "CATIA",                         slug: "catia",                 category: "CAD / Ingeniería",                 icon: "precision_manufacturing",  color: "outline" },
  { name: "Revit",                         slug: "revit",                 category: "CAD / Ingeniería",                 icon: "domain",                   color: "tertiary" },
  { name: "SketchUp",                      slug: "sketchup",              category: "CAD / Ingeniería",                 icon: "3d_rotation",              color: "secondary" },
  { name: "BIM",                           slug: "bim",                   category: "CAD / Ingeniería",                 icon: "foundation",               color: "outline" },
]

async function main() {
  console.log("Removing soft-skill entries...")
  const removed = await prisma.skill.deleteMany({
    where: { slug: { in: REMOVE_SLUGS } },
  })
  console.log(`  Removed ${removed.count} soft skills`)

  console.log("Removing skills with empty category...")
  const removedEmpty = await prisma.skill.deleteMany({
    where: { category: "" },
  })
  console.log(`  Removed ${removedEmpty.count} uncategorized skills`)

  console.log(`Seeding ${SKILLS.length} skills...`)
  let count = 0
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: { name: skill.name, category: skill.category, icon: skill.icon, color: skill.color },
      create: skill,
    })
    count++
    if (count % 20 === 0) console.log(`  ${count}/${SKILLS.length}...`)
  }
  console.log(`Skills seeded: ${count} total.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

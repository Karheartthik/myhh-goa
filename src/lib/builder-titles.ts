export const BUILDER_TITLES = [
  "AI Explorer", "Prompt Architect", "Code Wizard", "Bug Hunter", "Open Source Ninja",
  "Hackathon Hero", "Cloud Surfer", "Future Builder", "Design Alchemist", "DevOps Commander",
  "API Whisperer", "Frontend Magician", "Backend Samurai", "AI Dreamer", "Full Stack Beast",
  "Innovation Catalyst", "Neural Hacker", "Pixel Perfectionist", "Quantum Builder",
  "Startup Visionary", "Latency Slayer", "Schema Sculptor", "Shipping Machine",
  "Edge Runner", "Kernel Poet", "Data Cartographer", "Token Tamer", "Rust Ronin",
  "TypeScript Tactician", "Serverless Sailor", "Container Captain", "Pipeline Pilot",
  "Refactor Monk", "Regex Ranger", "Latency Alchemist", "Vector Voyager",
  "Embedding Explorer", "Model Mechanic", "Agent Architect", "Inference Ace",
  "GPU Whisperer", "Silicon Dreamer", "Bandwidth Bandit", "Cache Conjurer",
  "Protocol Pirate", "Packet Prophet", "Uptime Guardian", "Chaos Engineer",
  "Terminal Tactician", "Shell Sorcerer", "Commit Composer", "Merge Marshal",
  "Branch Bender", "Release Rockstar", "Sprint Sniper", "Deploy Daredevil",
  "Bugfix Buccaneer", "Stack Trace Sleuth", "Runtime Rebel", "Compile Commander",
  "Syntax Surfer", "Logic Luminary", "Algorithm Artisan", "Graph Guru",
  "Recursion Rider", "Bitwise Bandit", "Memory Maestro", "Thread Tamer",
  "Async Acrobat", "Promise Pilot", "Hook Herald", "State Sculptor",
  "Component Craftsman", "Layout Legend", "Motion Maker", "Shader Shaman",
  "Canvas Conjurer", "WebGL Wanderer", "Sound Smith", "Haptics Hacker",
  "UX Oracle", "Interface Illusionist", "Typography Titan", "Grid Guardian",
  "Contrast Champion", "Accessibility Ally", "Design Systems Druid", "Palette Pilgrim",
  "Growth Gladiator", "Analytics Astronaut", "Funnel Falcon", "Retention Ranger",
  "Payments Paladin", "Auth Architect", "Crypto Cartographer", "Ledger Legend",
  "Beach Coder", "Sunset Shipper", "Konkan Compiler", "Palm Tree Pythonista",
  "Monsoon Maker", "Susegad Sysadmin", "Feni Framework Fan", "Arabian Sea Architect",
  "Night Market Nerd", "Vagator Visionary", "Anjuna Automator", "Panjim Programmer",
] as const;

export const pickTitle = (): string =>
  BUILDER_TITLES[Math.floor(Math.random() * BUILDER_TITLES.length)] ?? "Future Builder";

export const makeBuilderId = () =>
  `HHG-2026-${Math.floor(100000 + Math.random() * 899999)}`;

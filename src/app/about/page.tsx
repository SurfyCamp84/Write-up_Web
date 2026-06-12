import Link from "next/link";
import Image from "next/image";
import ConnectSection from "./ConnectSection";

export const metadata = {
  title: "About — Surfy",
  description:
    "About Surfy — cybersecurity student, CTF player, and security researcher from the Czech Republic.",
};

const skills = [
  "Web Security",
  "Cryptography",
  "Reverse Engineering",
  "Binary Exploitation",
  "Forensics",
  "OSINT",
  "Steganography",
  "Scripting",
];

const tools = [
  { name: "Python", desc: "Scripting & Exploits" },
  { name: "JavaScript / TS", desc: "Web Development" },
  { name: "Bash", desc: "Automation & Scripting" },
  { name: "C / C++", desc: "Reverse Engineering" },
  { name: "SQL", desc: "Database Management" },
  { name: "HTML / CSS", desc: "Frontend Design" },
];

export default function AboutPage() {
  return (
    <main className="flex-1 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 py-20 relative z-10">
        
        {/* Header Profile Area */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-20">
          <div className="w-32 h-32 shrink-0 rounded-2xl border border-border-subtle bg-bg-card flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.1)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
            <Image
              src="/Surfy.png"
              alt="Surfy"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="text-center md:text-left">
            <p className="font-mono text-sm text-accent mb-3 tracking-wider">~/whoami</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4 tracking-tight">Surfy</h1>
            <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
              Cybersecurity student, CTF player, and security researcher from the Czech Republic 🇨🇿. Proud member of <span className="text-accent font-medium">Kyber Tým</span>.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          
          {/* Main Content Column */}
          <div className="md:col-span-2 space-y-12">
            <section>
              <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-border-subtle inline-block" /> 
                The Journey
              </h2>
              <div className="prose-writeup text-text-secondary space-y-5 text-[1.05rem]">
                <p>
                  I've always been fascinated by how things work under the hood. In cybersecurity, you don't just learn how a system functions—you learn how it assumes it will be used, and how to elegantly break those assumptions.
                </p>
                <p>
                  As a member of <strong className="text-text-primary">Kyber Tým</strong>, I spend my time diving into complex challenges, breaking down intricate systems, and participating in CTF competitions. Whether it's dissecting web vulnerabilities, untangling cryptography, or reverse engineering binaries, I love the thrill of the hunt.
                </p>
                <p>
                  This site is my personal archive. It's where I document my solves, share techniques I've learned, and hopefully help others on their security journey. Because in this field, every flag tells a story.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-border-subtle inline-block" /> 
                Tech Stack & Languages
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <div key={tool.name} className="group p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-bg-primary border border-border-subtle flex items-center justify-center font-mono text-sm font-bold text-text-secondary group-hover:text-accent transition-colors duration-300">
                      {tool.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{tool.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8 mt-2 md:mt-0">
            <div className="p-6 rounded-2xl border border-border-subtle bg-bg-card shadow-sm">
              <h3 className="text-sm font-mono tracking-wider text-text-primary mb-5 uppercase">Skillset</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-md bg-bg-secondary border border-white/[0.05] text-xs font-mono text-text-secondary hover:text-accent hover:border-accent/30 transition-all duration-300 cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border-subtle bg-bg-card shadow-sm">
              <h3 className="text-sm font-mono tracking-wider text-text-primary mb-5 uppercase">Connect</h3>
              <ConnectSection />
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}

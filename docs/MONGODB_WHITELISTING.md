MongoDB Atlas - IP Whitelisting Checklist

If you see a MongooseServerSelectionError like "Could not connect to any servers in your MongoDB Atlas cluster" it's commonly due to network access restrictions (IP whitelist) or cluster/network issues.

Follow this checklist:

1. Confirm cluster & user
   - Ensure your Atlas cluster is deployed and in "running" state.
   - Confirm the database user exists and the username/password in `.env` (`MONGODB_URI`) are correct.

2. Check your public IP and add it to Atlas Network Access
   - Run the helper script to print your public IP:
     ```powershell
     node ./scripts/show-public-ip.js
     ```
   - Open Atlas: https://cloud.mongodb.com/
     - Go to "Network Access" -> "Add IP Address" -> paste the IP from the script.
     - Optionally add a short description (e.g., "Dev machine - home").
     - You can temporarily add `0.0.0.0/0` to allow all IPs for quick debugging (NOT recommended for production).

3. VPNs, Proxies, Corporate Networks
   - If you're on a VPN or behind a proxy/corporate firewall, try disabling it or whitelist the network IP.

4. Connection string format
   - Use the connection string provided by Atlas ("Connect" -> "Connect your application") and copy the SRV URI.
   - Example SRV: `mongodb+srv://<user>:<password>@cluster0.c2wdxy4.mongodb.net/prospera?retryWrites=true&w=majority`
   - Ensure special characters in passwords are URL-encoded.

5. Test connectivity from your machine
   - Use `mongosh` or `mongosh "mongodb://127.0.0.1:27017/prospera"` to test local connection.
   - For Atlas connections, use the SRV provided or `npx mongosh "<your-atlas-uri>"`.

6. Fallback option (local MongoDB)
   - For local development, you can run a local MongoDB and set `MONGODB_URI=mongodb://127.0.0.1:27017/prospera` in your `.env`.
   - On Windows you can start the MongoDB service (if installed) using PowerShell as Admin:
     ```powershell
     # Check service
     Get-Service -Name MongoDB -ErrorAction SilentlyContinue

     # Start service (if installed as 'MongoDB')
     Start-Service -Name MongoDB

     # Alternatively, run mongod directly (adjust path and dbpath):
     "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\data\db" --bind_ip 127.0.0.1
     ```

7. Still failing?
   - Check Atlas cluster logs (in the Atlas UI) for network errors.
   - Verify your Atlas project's IP allowlist and project-level access.
   - Reach out to MongoDB support with the error details.

Useful links:
- https://www.mongodb.com/docs/atlas/security-whitelist/
- https://cloud.mongodb.com/
- https://api.ipify.org

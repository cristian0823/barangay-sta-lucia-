# Deploying to Vercel - Complete Guide

---

## STEP 1: Deploy to Vercel

### Option A: Deploy via GitHub (Easiest)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Add New** → **Project**
4. Import your GitHub repo
5. Click **Deploy**

### Option B: Deploy via Drag & Drop
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Scroll down to "Or Drag & Drop a folder here"
4. Drag your project folder there

**After deploying, Vercel will give you a URL like:** `https://barangay-website-xxx.vercel.app`
**Copy this URL - you need it for Step 2!**

---

## STEP 2: Add Vercel URL to Supabase

### Where to go:
1. Open [supabase.com](https://supabase.com)
2. Click on your project named: **cojgsyrnexbwgsfttojq**
3. Look at the **left sidebar** - click **Settings** (gear icon ⚙️)
4. In Settings, click **API**

### What to do in API page:

#### Find "Site URL" section:
- Look for a field that says "Site URL" or "Redirect URLs"
- Enter your Vercel URL: `https://YOUR-VERCEL-PROJECT.vercel.app`
- Click **Save** button

#### Find "Authorized JavaScript origins":
- Look for this section in the same API page
- Click the **+** button or **Add** button
- Enter your Vercel URL: `https://YOUR-VERCEL-PROJECT.vercel.app`
- Click **Save**

---

## STEP 3: Check Table Permissions (IMPORTANT!)

If login still doesn't work, you need to enable table permissions:

### Go to: Supabase → Database → Users table

1. Go to [supabase.com](https://supabase.com) → Your project
2. Click **Database** in left sidebar
3. Find the **users** table
4. Click on **Policies** tab
5. **Check if RLS is enabled:**
   - If RLS is ON, you need to create policies
   - **Turn RLS OFF** for the users table (easiest fix):

### To Turn OFF RLS:
1. In Database page, click **Users** table
2. Click **Policies** tab
3. Click the **Disable RLS** button (or toggle off)
4. Click **Save**

Or if you prefer to keep RLS ON, add these policies:

```sql
-- Allow everyone to read users
CREATE POLICY "Allow public read" ON users
FOR SELECT USING (true);

-- Allow everyone to insert users
CREATE POLICY "Allow public insert" ON users
FOR INSERT WITH CHECK (true);

-- Allow everyone to update users
CREATE POLICY "Allow public update" ON users
FOR UPDATE USING (true);

-- Allow everyone to delete users
CREATE POLICY "Allow public delete" ON users
FOR DELETE USING (true);
```

### Repeat for ALL tables:
- equipment
- borrowings
- concerns
- events
- court_bookings

---

## STEP 4: Redeploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click on your project
3. Click on **Deployments** (top menu)
4. Find the latest deployment
5. Click the **...** (three dots) button
6. Click **Redeploy**

---

## STEP 5: Debug Login Issues

I've added debugging to your code. To see what's wrong:

### Open Browser Console:
1. Go to your deployed Vercel website
2. Right-click anywhere on the page
3. Click **Inspect** or **Inspect Element**
4. Click on **Console** tab

### Try to login with admin/user
5. Enter username: **admin** and password: **admin123**
6. Look at the console - you'll see:
   - "Supabase check - data: ..." or error messages
   - If login fails, you'll see an alert with the error

### Copy the error message and send it to me

---

## Summary

| What to do | Where |
|------------|-------|
| Deploy website | vercel.com → Add New → Project |
| Add Vercel URL to Supabase | supabase.com → Settings → API → Site URL |
| Add Vercel URL to CORS | supabase.com → Settings → API → Authorized JavaScript origins |
| Turn off RLS (fixes login) | supabase.com → Database → users → Policies → Disable RLS |
| Redeploy | vercel.com → Deployments → ... → Redeploy |
| Debug | Right-click → Inspect → Console → Try login → See errors |

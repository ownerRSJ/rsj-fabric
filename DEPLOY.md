# DEPLOY.md — how the code gets from this folder onto Google

Plain language, in order. You only do steps 1–4 once, ever.

> **Status:** steps 1–4 are DONE. The Apps Script project "RSJ Fabric" exists and
> the code is pushed, under **owner@rsjcarriers.com** — so the owner's account
> will own the four spreadsheets, which is the intended arrangement. Start at
> step 5.

**The one rule:** code travels in ONE direction — this folder → `clasp push` →
Apps Script. Never type code into the Apps Script website. If you edit there, the
next `clasp push` silently wipes it.

---

## Step 1 — Log in to Google (needed again; the old login expired)

In the Claude Code prompt, type this with the `!` in front:

    ! clasp login

A browser window opens.

**Log in as your daily `@rsjcarriers.com` account** — `rahul@rsjcarriers.com`.

- NOT `admin@` — that is a TOOL account. Amendment A8 makes the service layer
  reject writes from it, and files it owns would be awkward to hand over.
- NOT a personal Gmail. The whole audit trail is
  `Session.getActiveUser().getEmail()` (D10), and that only works reliably inside
  your own Workspace domain.

Whoever logs in here **owns the four spreadsheets that get created.** That should
be the company, not a personal account.

Check it worked:

    ! clasp show-authorized-user

## Step 2 — Turn on the Apps Script API (once per Google account)

Open <https://script.google.com/home/usersettings> and switch **Google Apps
Script API** to ON. Without this, `clasp` cannot create or update anything.

## Step 3 — Create the Apps Script project

    ! clasp create-script --title "RSJ Fabric" --type standalone

This writes a `.clasp.json` file in this folder containing the project id. That
file is deliberately **not** committed to the repo (CLAUDE.md rule 10 — no ids in
the repo). If you ever set this up on a second machine, copy
`.clasp.json.example` to `.clasp.json` and paste the id in.

If `create-script` puts `"rootDir"` anywhere other than `src`, fix it so the file
reads exactly:

```json
{ "scriptId": "…", "rootDir": "src" }
```

## Step 4 — Push the code up

    ! clasp push

You should see the six `.gs` files plus `appsscript.json` go up. Nothing else in
this folder is ever pushed.

---

## Step 5 — Build the workbooks

    ! clasp open-script

In the Apps Script editor, pick `bootstrap` from the function dropdown at the top
and press **Run**.

The first run asks you to authorize the script — approve it. (Google will warn
that the app "isn't verified"; that is normal for your own script. Choose
**Advanced → Go to RSJ Fabric**.) It takes a couple of minutes because it is
creating four spreadsheets and 36 sheets.

Running it a second time is safe. It never deletes a sheet, never rewrites a
header row that already has content, and never resets a counter that has moved.

## Step 6 — The go-live-morning ritual

> **Do this on the MORNING you go live — not before.** Around 100 challans are
> consumed every two or three days, so a number written down last week is wrong
> by lunchtime. This step is deliberately the last thing that happens.

There is no longer a single challan number, and no `CHALLAN_SEED` property.
Challans are born **per series** (Amendment A14), so there are two separate
things to record, and they work differently on purpose.

### 6a. JNPT — register the paper book in play

JNPT's numbers are **printed on the paper book by the printer**. The system does
not invent them; it keeps an index of the book so the two can never drift apart.
It is the same arrangement as the LR book.

From the challan book currently in use, your father supplies:

| What | Example |
|---|---|
| The book's printed range — first and last leaf | `43500` to `43599` |
| The next **blank** leaf as of that morning | `43512` |

Anything already used or struck through in that book gets recorded as used or
cancelled — and a cancelled leaf keeps its reason and never becomes a trip.

### 6b. Hazira — set the counter

Hazira has **no paper book**; its series has always been digital, currently in
the 9000s. Here the system genuinely does mint the number, and it carries an `H`
so it can never be confused with a JNPT number.

In the Apps Script editor: **Project Settings** (the gear on the left) →
**Script Properties** → **Add script property**

| Property | Value |
|---|---|
| `HAZIRA_CHALLAN_SEED` | that morning's next Hazira number, e.g. `9123` |

Enter the plain number — the `H` is added by the system. It lives here, not in
the code, so the number never lands in the repo.

Then run `bootstrap` once more to write the counter.

**Both are owner-supplied and never invented.** Seeding early, or from history,
mints numbers that collide with challans already written on paper — and that
duplicate error would come from inside the house.

## Step 7 — Check the work

Run the function `verify`. The **Execution log** panel opens by itself at the
bottom of the screen — there is no menu to click.

You want the line at the top to read **ALL PASS**.

The log prints a short summary: a count of each kind of check, then every
failure and warning spelled out in full. If you ever want the complete
row-by-row table, run `verifyFull` instead — it writes all ~150 rows into a
`_VERIFY_REPORT` sheet inside WB-GOV and prints the link, because that much text
does not fit in the log.

- `FAIL` — something is genuinely wrong. Bring the log back here.
- `WARN` — nothing is broken; a real-world fact is still outstanding (Traffic
  Manager names, the empty user roster, and — until go-live morning — the
  unregistered JNPT book and unseeded Hazira counter). These are expected at this
  stage and are listed in the handover notes.

Run `showWorkbookLinks` to print the four spreadsheet URLs, and open each one to
see the sheets with your own eyes. That is the Phase 1 definition of done.

---

## 🛑 Then stop

Phase 1 ends here. Phase 2 — the service layer with logins, role gates, the
hash-chained audit log and ID minting — starts **only** after Checkpoint #2 is
discussed in the Claude project chat. That gate is in ROADMAP.md and it is not
optional.

---

## Later changes, every time

1. Change the file in this folder.
2. `! clasp push`
3. Run `verify` in the editor.
4. Commit.

Never the other way round.

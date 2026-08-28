# DEPLOY.md — how the code gets from this folder onto Google

Plain language, in order. You only do steps 1–4 once, ever.

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

## Step 5 — Give the script the owner's challan number

**This is the one number only your father can supply**, and it must be right
before anything else happens.

The challan series continues the numbering already in live use (D6) — it does
**not** start at 1. On the morning you run this, ask him for the **next challan
number** that would have been written by hand.

    ! clasp open-script

In the Apps Script editor: **Project Settings** (the gear on the left) →
**Script Properties** → **Add script property**

| Property | Value |
|---|---|
| `CHALLAN_SEED` | the number he gives you, e.g. `43486` |

It lives here, not in the code, so the number never lands in the repo.

`bootstrap()` refuses to run without it, on purpose. A challan series that
silently restarted at 1 would break every join back to eCount.

## Step 6 — Build the workbooks

Still in the Apps Script editor, pick `bootstrap` from the function dropdown at
the top and press **Run**.

The first run asks you to authorize the script — approve it. It takes a couple of
minutes because it is creating four spreadsheets and 33 sheets.

Running it a second time is safe. It never deletes a sheet, never rewrites a
header row that already has content, and never resets a counter that has moved.

## Step 7 — Check the work

Run the function `verify`. Then **View → Logs** (or Ctrl+Enter).

You want a table ending in **ALL PASS**.

- `FAIL` — something is genuinely wrong. Bring the log back here.
- `WARN` — nothing is broken; a real-world fact is still outstanding (Traffic
  Manager names, the empty user roster, unbucketed expense categories). These are
  expected at this stage and are listed in the handover notes.

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

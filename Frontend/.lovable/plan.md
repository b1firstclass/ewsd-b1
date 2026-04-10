

# User Flow Diagrams — Discussion for All 5 Participants

Here is the complete user journey I've mapped from the codebase for each role. Let's confirm these flows before I generate the Mermaid diagrams.

---

## 1. Student User Flow

```text
Open Website → Login Screen → Enter Credentials
  ├─ Auth Fails → Error Message → Retry
  └─ Auth Success → First Login? → Welcome Modal → Student Dashboard
                    └─ Returning → Show Last Login → Student Dashboard

Student Dashboard:
  ├─ View Stat Cards (Total, Draft, Submitted, Under Review, Approved, Selected)
  ├─ View Deadline Progress (Submission + Final Closure dates)
  ├─ Click Stat Card → My Submissions (filtered by status)
  ├─ Click "Start New Contribution" → Submission Form Modal
  │     ├─ Select Category
  │     ├─ Enter Subject + Description
  │     ├─ Upload Word Doc + Image (validated)
  │     ├─ Accept Terms & Conditions (mandatory)
  │     └─ Save as Draft OR Submit
  ├─ Click Contribution Card → Detail Panel
  │     ├─ View Status Timeline (Draft→Submitted→Under Review→Approved→Selected)
  │     ├─ View/Download Attachments
  │     ├─ Read Coordinator Comments
  │     ├─ Edit (if Draft/Revision Required)
  │     └─ Submit (if Draft)
  └─ Sidebar: My Submissions → Full submissions list with search/filter
```

## 2. Coordinator User Flow

```text
Open Website → Login → Auth Success → Coordinator Dashboard

Coordinator Dashboard:
  ├─ View 14-Day Comment Deadline Alerts (critical/warning badges)
  ├─ View Stat Cards (Submitted, Under Review, Revision Req., Approved, Selected, Rejected)
  ├─ Click Stat Card → Review Queue (filtered)
  ├─ Click Contribution Card → Detail Panel
  │     ├─ View Status Timeline
  │     ├─ View/Download Documents
  │     ├─ Add Comments (within 14-day window)
  │     └─ Change Status: Approve / Reject / Request Revision / Select
  ├─ Sidebar: Review Queue → Full queue with search, status filter, deadline filter, grid/list view
  ├─ Sidebar: Analytics → Faculty Analytics Page
  │     ├─ Status Distribution Chart
  │     ├─ Exception Report: Contributions Without Comments
  │     └─ Exception Report: Contributions Overdue 14 Days
  └─ Sidebar: Guest List → View faculty's registered guests
```

## 3. Manager User Flow

```text
Open Website → Login → Auth Success → Manager Dashboard

Manager Dashboard (READ-ONLY cross-faculty):
  ├─ View Contribution Count by Faculty (Bar Chart)
  ├─ View Contribution Percentage by Faculty (Doughnut Chart)
  ├─ View Faculty User Distribution (Horizontal Bar Chart)
  ├─ View Top Contributors
  ├─ View Exception Reports (Without Comment + 14-Day Overdue)
  ├─ Filter by Academic Year
  └─ Sidebar: Export Center
        ├─ View all Selected contributions
        ├─ Select individual / Select All
        └─ Download as ZIP file
```

## 4. Guest User Flow

```text
Open Website → Login → Auth Success → Guest Dashboard

Guest Dashboard (READ-ONLY, single faculty):
  ├─ View Faculty Info + Statistics (total selected, categories)
  ├─ View Faculty Timeline
  ├─ Browse Selected Contribution Cards
  ├─ Click Card → View Detail (read-only, no edit/comment)
  └─ Sidebar: Selected Contributions → Browse all selected works
```

## 5. Admin User Flow

```text
Open Website → Login → Auth Success → System Monitoring

System Monitoring:
  ├─ Overview Tab: Most Viewed Pages, Most Active Users, Browser Stats (charts)
  ├─ Analytics Tab: Hourly Activity Trends (date-range picker), Device Breakdown
  └─ Summary Tab: Faculty User Distribution, System Health

Sidebar Navigation:
  ├─ Contribution Windows → CRUD table (academic year, faculty, dual deadlines)
  ├─ User Management → CRUD table (assign roles + faculties)
  ├─ Role Management → CRUD table (permissions per role)
  └─ Faculty Management → CRUD table (faculty names)
```

---

## Diagram Style

Each diagram will be a **top-down flowchart** with:
- Decision diamonds for auth/conditions
- Rounded boxes for screens/pages
- Subgraphs grouping related actions (e.g., "Dashboard", "Detail Panel")
- Color-coded nodes per role for visual distinction

## Deliverables

5 separate `.mmd` files in `/mnt/documents/`:
1. `Student_UserFlow.mmd`
2. `Coordinator_UserFlow.mmd`
3. `Manager_UserFlow.mmd`
4. `Guest_UserFlow.mmd`
5. `Admin_UserFlow.mmd`

**Does this flow mapping look correct and complete? Any screens or actions I should add/remove before generating the diagrams?**


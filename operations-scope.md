Executive Booking and Engagement Operations Platform

Product Goal
Create one secure operating system for Dr. Akin Akinpelu’s engagements—from the first invitation through review, confirmation, travel, preparation, delivery, and closeout.

The platform should reduce administrative back-and-forth, prevent scheduling conflicts, give organizers clear status visibility, and give Executive Assistants one reliable source of truth.

Recommended Product Structure
The platform should have three distinct experiences:
Public Booking Experience — organizers submit an invitation and understand what information is required.
Organizer Engagement Portal — each organizer securely tracks status, supplies outstanding information, and accesses approved resources for their engagement.
Private Executive Assistant Workspace — the team reviews requests, manages the calendar, coordinates logistics, prepares briefs, and controls organizer access.

User Roles and Administrative Authority
Super Admin — Dr. Akin
Has executive ownership of the platform and can:
Access every booking, engagement, inbox message, resource, calendar record, and audit log.
Create, assign, upgrade, suspend, and revoke administrative users.
Grant or withdraw operational permissions.
Review every successful or failed admin sign-in.
Review an immutable history of material actions performed in the admin area.
Approve, decline, or return invitations for further review.
Access the unified inbox for general enquiries, contact requests, and speaking invitations.
Export operational and audit records.
The system must prevent deletion or demotion of the final active Super Admin.

Technical Admin — Platform Owner
Has technical and administrative control and can:
Configure integrations, permissions, resources, and platform settings.
Create, assign, upgrade, suspend, and revoke operational admin users.
Review audit and diagnostic information required to maintain the platform.
Access booking, engagement, calendar, resource, and inbox workflows.
Manage database-backed configuration and security settings.
Recommended safeguard: a Technical Admin may manage operational roles but cannot demote, suspend, or revoke a Super Admin. Changes to Super Admin accounts require another Super Admin or a documented recovery procedure.

Operational Admin Roles
Executive Assistant — requests, engagements, calendar, checklists, organizer communication, logistics, and briefs.
Executive Reviewer — summarized requests, conflict warnings, private comments, and decision recommendations.
Inbox Manager — general enquiries, speaking enquiries, assignment, status, and replies.
Resource Manager — biographies, photographs, introductions, versioning, visibility, and archives.
Read-only Auditor — audit logs and reports without permission to change records.

Executive Assistants / Administrators
Can:
View and manage all booking requests.
Update request statuses.
Add internal notes that organizers cannot see.
Review conflicts and calendar availability.
Request missing information.
Screen, assign, tentatively hold, prepare, and archive requests; final approval or decline is permission-gated and not granted to every EA.
Manage travel and logistics.
Generate and edit engagement briefs.
Upload and approve official organizer resources.
Control which information is visible to each organizer.
Export engagement records and schedules.

Super Admin Approval View
Dr. Akin’s Super Admin account should include a focused executive view that can:
Review summarized requests without navigating operational form fields.
See schedule and conflict warnings.
Add private executive comments.
Approve, decline, delegate, or return a request to the EA team.
View confirmed-event briefs and itineraries.
This is a streamlined view inside the Super Admin role, not a separate restricted account.

Event Organizers
Can:
Submit a booking request.
Securely access only their own engagement.
Track its current status.
Respond to requests for additional information.
Complete the pre-engagement checklist.
Upload approved files and logistics details.
Download approved biography, photographs, introduction, and organizer resources.
View the final engagement summary relevant to them.

Organizers should not see private calendar details, other engagements, internal notes, travel documents unrelated to them, or internal decision history.

Core Workflow
Draft invitation
→ Submitted / Received
→ Initial screening
→ Under review
→ Tentative calendar hold, if appropriate
→ More information requested, if needed
→ Approved in principle
→ Organizer completes outstanding requirements
→ Confirmed
→ Travel and logistics coordination
→ Final event brief prepared
→ Ready for engagement
→ Completed
→ Archived / follow-up
Alternative outcomes:
Under review → Declined
Under review → Withdrawn by organizer
Tentative hold → Released
Confirmed → Cancelled

Booking Status Model

Organizer-visible statuses
Keep organizer language simple:
Received — The request has been successfully submitted.
Under Review — The team is evaluating the invitation and schedule.
Information Required — The organizer must provide additional details.
Tentatively Available — The date is being held, but the engagement is not confirmed.
Confirmed — The engagement has been approved and scheduled.
Declined — The invitation cannot be accepted.
Cancelled — A previously active engagement has been cancelled.
Completed — The engagement has taken place.

Internal EA statuses
The private workspace can use more detailed operational stages:
New / Unassigned
Screening
Awaiting Executive Review
Awaiting Organizer Information
Tentative Hold
Commercial / Terms Review
Approved in Principle
Confirmed
Logistics in Progress
Brief in Preparation
Ready
Completed
Declined
Cancelled
Archived
Every status change should record:
Previous status
New status
Date and time
Person who changed it
Optional private reason
Optional organizer-facing message

1. Public Booking and Invitation Request

Recommended route
/book-dr-akin
The existing speaking page can remain a persuasive marketing page and send qualified visitors to this structured booking request.

Form sections
Organizer and organization
Organization name
Organization type
Organizer’s full name
Role/title
Email address
Phone/WhatsApp number
Country and time zone
Organization website
Event overview
Event name
Event type
Event objective
Proposed topic or theme
Expected audience
Estimated audience size
Audience profile
Public, private, internal, or media event
In-person, virtual, or hybrid
Date and timing
Preferred date
Alternative date(s)
Start time
Expected speaking time
Full event duration
Time zone
Is the date flexible?
Location and travel
Venue name
City and country
Venue address, if known
Travel required?
Departure city assumptions
Accommodation provided?
Local transport provided?
Engagement requirements
Keynote
Panel
Fireside conversation
Workshop
Executive session
Advisory meeting
Media interview
Other
Commercial and protocol
Proposed budget or fee range
Currency
Payment terms, if known
Protocol/VIP requirements
Security considerations
Recording or livestreaming planned?
Content usage or redistribution requested?
Supporting material
Formal invitation letter
Event concept note
Program or agenda
Sponsorship deck
Other supporting files
Consent and declaration
Accuracy confirmation
Privacy acknowledgement
Permission for the team to contact the organizer
Clear notice that submission does not constitute acceptance

Submission result
After submission, the organizer receives:
A unique booking reference number.
A confirmation email.
A secure tracking link.
The initial status: Received.
A clear expected response window set by the team.

Admin Authentication and Account Security

Login method
Admin login must require an approved email address and password. Magic-link-only login should not be used for administrators.
Requirements:
Email verification before first access
Strong password policy and secure password reset
Session expiry and explicit sign-out
Temporary lockout or rate limiting after repeated failures
Immediate session revocation when an admin is suspended or revoked
No public self-registration
Optional two-factor authentication, recommended for privileged roles
Admin accounts are invited only by an authorized Super Admin or Technical Admin.

Account lifecycle
Invited → Email verified → Active → Role updated as required → Suspended or revoked → Sessions terminated
Every role, permission, suspension, reactivation, password-reset, and revocation event must be audited.

Admin Roles and Permission Management
/admin/users
/admin/users/[user-id]
/admin/roles
/admin/audit-log
Capabilities:
Invite admins by email.
Assign a primary role and granular permissions.
Upgrade or downgrade operational roles.
Suspend or revoke access.
Force sign-out from all sessions.
Record who granted or removed each permission.
Prevent unauthorized privilege escalation.
Prevent deletion or demotion of the final Super Admin.

Sign-in and Administrative Audit Log
Record successful and failed sign-ins, password resets, sign-outs, session revocations, account suspensions, and reactivations. Record material actions affecting requests, messages, calendar blocks, checklists, logistics, briefs, resources, users, roles, exports, and settings.
Audit protections:
Events are append-only.
Normal admins cannot edit or delete them.
Super Admins can view and export logs but cannot rewrite history.
Passwords, tokens, and full sensitive documents are never logged.
Events include actor, role, action, target, timestamp, browser/device summary, and appropriate network metadata.

Unified Enquiry Inbox
/admin/inbox
/admin/inbox/[enquiry-id]
The inbox combines general Contact Me enquiries, speaking/advisory enquiries, structured booking requests, and follow-up messages.
Capabilities:
Filter by source, status, urgency, date, and assignee.
Assign to an admin.
Mark New, Open, Awaiting Reply, Resolved, Spam, or Archived.
Convert a general or speaking enquiry into a structured booking request.
Link related messages to the same person, organization, or engagement.
Add private notes while preserving the original submission.
Record replies and status changes in the audit log.
Restrict enquiries containing sensitive or commercial information.
The website should continue using Ploy’s built-in form capture and owner notifications while also writing enquiry records to the secure database, making the admin inbox the operational system of record.

2. Private Executive Assistant Workspace
Recommended route family
/admin
/admin/requests
/admin/requests/[request-id]
/admin/calendar
/admin/engagements
/admin/resources
/admin/reports
/admin/settings
All /admin routes must require authenticated, role-based access.

Requests dashboard
The default view should show:
New requests requiring action
Requests awaiting Dr. Akin’s review
Requests awaiting organizer information
Tentative holds nearing expiry
Confirmed engagements with incomplete logistics
Upcoming engagements without finalized briefs
Recently declined or cancelled requests

Filters
Status
Date range
Event type
Country/city
Assigned EA
In-person/virtual/hybrid
Priority
Travel required
Missing information
Conflict detected

Request detail view
Recommended sections:
Request summary
Organizer and organization
Event details
Date and calendar conflicts
Commercial/terms information
Submitted documents
Internal notes
Organizer-visible messages
Status history
Tasks and checklist
Travel and logistics
Engagement brief
Audit trail

Team collaboration
Assign an EA owner.
Add due dates and internal tasks.
Mention another authorized team member.
Separate internal notes from organizer-facing communication.
Flag urgent, VIP, international, or high-complexity requests.

3. Executive Calendar

Purpose
Provide the EA team with an accurate private view of availability and confirmed commitments while preventing double-booking.
Calendar states
Available
Unavailable / blocked
Tentative hold
Confirmed engagement
Travel day
Personal/private block
Organizers should never see the private calendar. At most, the public form may indicate that a requested date is subject to review.

Calendar decision status
Current decision: provider-neutral. The authoritative external calendar has not yet been selected. The MVP should therefore maintain its own engagement dates, tentative holds, private blocks, travel buffers, and conflict rules behind a calendar-provider interface. Google Calendar or Microsoft Outlook synchronization can be added later without changing the booking workflow or data model.

Calendar functionality
Month, week, and agenda views
Time zone display
Tentative hold creation
Hold-expiry date and reminders
Conflict detection
Travel buffer before/after international engagements
Manual private blocks
Linked engagement records
Calendar notes visible only to authorized staff
Optional synchronization with the team’s existing calendar provider

Conflict rules
The system should flag:
Same-time overlaps
Same-day overlaps
Insufficient travel time between cities/countries
Requests during blocked dates
Tentative holds that conflict with a new request
Confirmed events without travel buffers
The system should warn rather than automatically reject. Final scheduling decisions remain with the team.

Global Enquiry Modal
The global Inquire button and relevant speaking-engagement CTAs should open an accessible modal instead of sending visitors to a page where they must scroll to reach the form.
Recommended behavior:
Open from the header, footer CTA, speaking page, Meet page, and relevant engagement CTAs.
Use a focused multi-step form that remains usable on mobile.
Preserve /book-dr-akin as the full-page fallback and shareable URL.
Trap keyboard focus, close on Escape, and return focus to the triggering button.
Warn before closing when information has been entered.
Preserve progress during the current browser session.
Show the booking reference inside the modal after submission.
Include an “Open full booking page” link.
Recommended steps:
Contact — organizer, organization, email, phone.
Engagement — type, event, objective, format, audience.
Schedule — preferred date, alternatives, city/country, travel.
Requirements — budget, recording, protocol, consent, review, submit.
On mobile, use a full-height sheet with a sticky progress header and sticky Back/Continue actions rather than a narrow dialog containing one long form.

4. Organizer Booking Status Tracker
Recommended access model
Use a secure, expiring email link or one-time verification code rather than forcing every organizer to create and remember a password.
Each organizer can access only the request associated with the verified email and secure token.
Recommended route
/booking/[secure-reference]
Organizer view
Event name and booking reference
Current status
Date of latest update
Short explanation of the current status
Outstanding actions
Secure message/update area
Uploaded documents
Approved downloadable resources
Key confirmed details
Team contact channel
Communication rules
Do not expose internal notes or reasons unless deliberately shared.
Every organizer-facing status update should trigger an email notification.
Avoid displaying private calendar information.
Declines should allow a respectful custom message.

5. Pre-Engagement Checklist
The checklist should activate after approval in principle or confirmation.

Organizer requirements
Final venue name and full address
Event date and local time
Speaking start time and duration
Arrival/reporting time
Final agenda/program
Event objective
Audience profile and size
Topic/title confirmation
Moderator or host details
Introduction preference confirmed
Presentation format and AV requirements
Recording/livestream permissions
Media/interview expectations
Dress code
Protocol/VIP requirements
Security information
On-site contact person
Emergency contact
Airport pickup details
Accommodation details
Flight booking responsibility
Visa/invitation letter requirements
Payment and contract completion

EA requirements
Executive approval recorded
Calendar event confirmed
Contract/terms completed
Invoice/payment status confirmed
Travel documents verified
Hotel verified
Driver/transport verified
Final event brief approved
Biography/photo/introduction version selected
Presentation materials ready
Follow-up owner assigned

Checklist behavior
Required vs optional items
Owner for each item
Due date
Completion status
File attachment
Reminder schedule
Internal or organizer-visible setting
Progress percentage
“Ready” state only when mandatory items are complete or explicitly waived

6. Travel and Logistics
Visibility
Travel data should be private by default. Organizers should see only the logistics they are responsible for or that have been intentionally shared.
Information model
Departure and destination cities
Flight airline and number
Departure/arrival time and time zone
Booking reference
Ticket file
Seat or service notes
Visa requirements
Airport pickup contact
Driver name and phone
Vehicle details
Hotel name and address
Reservation number
Check-in/check-out dates
Ground transport schedule
Venue transfer time
Return travel
Emergency contacts
Special instructions

Security rule
Passport numbers, identification documents, ticket details, booking references, and personal travel information are sensitive. Access should be restricted, logged, and limited to the minimum authorized team.

7. Media and Event Brief
Purpose
Produce one reliable pre-event summary for Dr. Akin and the EA team.
Brief contents
Event name
Date, time, and time zone
Venue and city
Event objective
Organization profile
Audience profile and expected size
Engagement format
Confirmed topic/title
Key discussion points
Speaking duration
Agenda position
Host/moderator
Dress code
Protocol/VIP notes
Media and recording details
Organizer contacts
On-site contact
Travel summary
Accommodation summary
Driver/transport summary
Risks, sensitivities, or special considerations
Outstanding actions
Attached agenda and invitation
Output formats
Responsive on-screen brief
Print-friendly/PDF export
Optional concise mobile “day-of” view
The generated brief should remain editable by an authorized EA before it is finalized.

8. Resource Centre
Public or controlled resources
Recommended route: /organizer-resources
Contains approved, current versions of:
Short biography
Medium biography
Full biography
Preferred introduction
Official headshots
Landscape photographs
Approved logos/brand marks, if applicable
Speaker one-sheet
Topic summaries
Technical/AV requirements
Media usage guidance
Name, title, and pronunciation guidance
Social links and website URL

Resource management
The EA workspace should allow authorized users to:
Upload new versions.
Mark one version as current.
Set public, organizer-only, or internal visibility.
Add usage notes.
Archive outdated files without deleting historical engagement records.
Track version and approval date.
Confirmed organizers should see only current approved resources or resources specifically attached to their engagement.

Information Architecture

Public website additions
/meet-akin/speaking             Existing marketing and qualification page
/book-dr-akin                   Structured booking request
/booking/[secure-reference]     Organizer status and engagement portal
/organizer-resources            Approved public organizer resources

Private operations workspace
/admin
├── /inbox
│   └── /[enquiry-id]
├── /requests
│   └── /[request-id]
├── /calendar
├── /engagements
│   └── /[engagement-id]
├── /resources
├── /users
│   └── /[user-id]
├── /roles
├── /audit-log
├── /reports
└── /settings

Recommended Data Structure

Admin User and Role
Authenticated user ID
Approved email address and full name
Primary role and granular permissions
Account state: Invited, Active, Suspended, or Revoked
Invited by and date
Last successful sign-in
Session-revocation timestamp

Audit Event
Actor user ID and role
Event type
Target record type and ID
Before/after summary for material changes
Timestamp
Sign-in result where applicable
Browser/device summary and appropriate network metadata
Immutable event details excluding secrets

Enquiry
Source: Contact, Speaking, Booking, or Follow-up
Contact name, email, phone, and organization
Subject/category and original message
Status, priority, and assigned admin
Linked booking request or engagement
Private notes and original submission payload
Created/updated timestamps

Booking Request
Unique ID and public reference
Organizer identity and contact information
Organization information
Event information
Proposed dates and flexibility
Location and travel requirements
Engagement format
Budget/terms information
Current public status
Current internal status
Assigned EA
Priority
Submission source
Created/updated timestamps

Engagement
Created when a request is approved in principle or confirmed.
Linked booking request
Confirmed date/time/time zone
Calendar event reference
Final location
Final format and topic
Contract/payment status
Checklist progress
Logistics record
Brief record
Completion/follow-up status

Calendar Block
Type
Start/end
Time zone
Visibility
Linked engagement or request
Hold expiry
Notes

Checklist Item
Engagement
Category
Label
Owner
Required/optional
Internal/organizer-visible
Due date
Status
Completion evidence

File/Resource
File
Category
Version
Approval status
Visibility
Usage note
Linked request/engagement, if applicable
Uploaded by/date

Status Event
Request/engagement
Previous/new status
Actor
Timestamp
Internal reason
Organizer message

Message/Update
Request/engagement
Sender
Recipient scope
Message
Attachments
Timestamp

Notifications
Organizer notifications
Request received
Status changed
Additional information requested
Tentative availability communicated
Engagement confirmed
Checklist item due
New organizer resource available
Schedule/logistics updated
Engagement cancelled or declined

EA notifications
New request received
High-priority request received
Organizer responded
Tentative hold nearing expiry
Scheduling conflict detected
Required checklist item overdue
Travel/logistics incomplete
Brief not finalized by deadline
Confirmed engagement approaching
Notifications should link directly to the relevant record and avoid exposing sensitive details in email.

Search, Reporting, and Operational Visibility
Recommended dashboard metrics:
Requests received by month
Requests by status
Confirmation rate
Average first-response time
Average time from submission to decision
Upcoming confirmed engagements
Tentative holds
Declined/cancelled reasons
Engagements by country, type, and audience
Outstanding organizer requirements
Outstanding travel/logistics tasks

Security and Privacy Requirements
Minimum requirements
Authenticated private workspace
Role-based permissions
Organizer records isolated from one another
Secure, expiring organizer access links or one-time codes
Server-side authorization for every private record request
Encrypted transport
File access controls
Audit log for status, permission, and sensitive-data changes
Rate limiting and anti-spam protection on the public booking form
File type and file size restrictions
Malware scanning for uploaded documents where available
Backup and retention policy
Ability to revoke organizer access
Session expiry for staff accounts

Sensitive information
Restrict travel documents, passport/identity information, ticket references, personal calendar blocks, private phone numbers, internal notes, financial terms, and executive comments to explicitly authorized users.

Recommended Delivery Phases

Phase 1 — Secure Admin and Booking Operations MVP
Goal: replace scattered email and phone follow-up with one managed request workflow and a secure, accountable admin foundation.
Entry conditions:
Super Admin and Technical Admin identities are confirmed.
Privilege boundaries and recovery rules are approved.
Admin email domain and password policy are agreed.
Includes:
Global multi-step enquiry modal plus full-page fallback
Public booking request
Secure database
Email-and-password admin authentication
Super Admin, Technical Admin, and operational roles
Admin invitation, assignment, upgrade, suspension, and revocation
Sign-in and administrative audit log
Unified enquiry inbox for contact, speaking, and booking submissions
EA authentication and roles
Requests dashboard
Request detail and internal notes
Status workflow
Organizer status tracker
Email notifications
Basic resource centre
Manual calendar blocks and conflict warnings
Audit history
Success criteria:
Every new contact, speaking, and booking enquiry enters one inbox.
Admin access requires an approved email and password.
Super and Technical Admins can manage operational admin access within approved safeguards.
Super Admins can inspect sign-in and material action history.
EAs can assign, review, update, and search requests.
Organizers can check status without calling or emailing.
No organizer can see another organizer’s information.

Phase 2 — Confirmation and Preparation
Goal: make every confirmed engagement operationally ready.
Includes:
Engagement records
Pre-engagement checklist
Organizer uploads and responses
Due dates and reminders
Travel and logistics workspace
Final event detail confirmation
Media/event brief generation
PDF/print export
Resource version control
Success criteria:
Mandatory requirements are visible and owned.
Upcoming engagements show readiness at a glance.
Each confirmed engagement has one final brief.

Phase 3 — Calendar Integration and Automation
Goal: reduce manual scheduling and repetitive administration.
Includes:
Synchronization with the team’s chosen calendar provider
Automated tentative holds and hold expiry
Travel buffer rules
Advanced conflict detection
Workflow automation
Reporting and trend dashboards
Reusable event templates
Optional approval workflow for Dr. Akin
Success criteria:
Confirmed engagements and private blocks remain synchronized.
Conflicts are surfaced before confirmation.
Routine reminders and status messages require minimal manual effort.

Scope Guardrails
For the first release, avoid:
Exposing live calendar availability publicly.
Automatically confirming a request.
Requiring organizers to create full accounts unless necessary.
Building a complex CRM before the request workflow is proven.
Storing sensitive travel or identity documents without clear need and access rules.
Mixing internal notes with organizer-visible messages.
Allowing uploaded files to become publicly accessible by default.

Product Decisions Required Before Design or Implementation
Calendar provider: deferred. Keep the MVP provider-neutral; select Google Calendar, Microsoft Outlook, or standalone operation before Phase 3 synchronization.
Who can make the final accept/decline decision?
Which EA roles require access to financial terms and sensitive travel details?
Should the resource centre be fully public, organizer-only, or mixed visibility?
Should organizers communicate inside the portal, by email, or through both with email replies synchronized?
What response-time promise should appear after submission?
What information is mandatory at initial submission versus requested only after approval?
Is contract, invoice, and payment tracking part of this platform or handled in an external system?
How long should declined, cancelled, and completed records be retained?
Should Dr. Akin have a dedicated approval view or receive summarized approval requests through an existing channel?

Current Alignment Decisions
Confirmed requirements:
Admin authentication uses email and password.
Dr. Akin is the Super Admin.
The platform owner is the Technical Admin.
Both privileged roles may manage operational admin users, subject to the safeguard that a Technical Admin cannot demote, suspend, or revoke a Super Admin.
Super Admins can review sign-in and material action logs.
Super Admins can access the unified inbox for contact and speaking enquiries.
Global enquiry CTAs open a modal, while /book-dr-akin remains the accessible full-page fallback.
Calendar integration remains provider-neutral for the MVP.
Supabase setup will restart only after this revised scope and privilege model are approved.
Decision still required before implementation:
Whether the enquiry modal captures the complete four-step booking request or a shorter initial enquiry that is completed later in the organizer portal.
Whether two-factor authentication is mandatory immediately for Super and Technical Admins.
Whether Dr. Akin alone has final accept/decline authority or may delegate it.

Recommended Next Planning Deliverables
Before coding begins:
Confirm the communication system now; defer the external calendar provider until Phase 3 while preserving a provider-neutral calendar model.
Approve the user roles and visibility rules.
Finalize the booking form field list.
Finalize public and internal status names.
Define the MVP boundary.
Produce low-fidelity screen flows for:
Public booking
Organizer tracker
EA request dashboard
Request detail
Calendar
Confirmed engagement checklist
Travel/logistics
Event brief
Complete a security and data-retention review.
Only then create the technical architecture and implementation plan.


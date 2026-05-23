export const docs = [
  {
    id: 1,
    intent: "billing",
    content: `
Billing & Payment Policy

Customers can pay using credit cards, debit cards, UPI, net banking, and digital wallets.
Payment failures may occur because of bank downtime, insufficient balance, or OTP verification timeout.

Invoices are automatically generated after successful payment and are available in the Billing section.
Customers requesting GST invoices must ensure GST details are entered before checkout.

Double payment cases are usually resolved automatically within 5 business days.
If duplicate charges persist, customers should contact billing support with transaction IDs.

Subscription plans renew automatically unless cancelled before the renewal date.
Refunds for accidental renewals are reviewed on a case-by-case basis.
`
  },

  {
    id: 2,
    intent: "billing",
    content: `
Refund Processing Guidelines

Refund requests are accepted within 30 days of purchase.
Approved refunds are credited to the original payment method within 5 business days.

Refund statuses include:
- Pending
- Under Review
- Approved
- Rejected
- Completed

Refunds may be delayed during weekends or banking holidays.
Customers are notified via email whenever the refund status changes.
`
  },

  {
    id: 3,
    intent: "shipping",
    content: `
Shipping & Delivery Policy

Orders are processed within 2 business days after payment confirmation.
Tracking IDs are sent through email and SMS after dispatch.

Domestic orders usually arrive within 3-5 business days.
International deliveries may take between 7-14 business days.

Customers can track shipments using the Track Order page.
Possible statuses include:
- Processing
- Packed
- Shipped
- Out for Delivery
- Delivered
`
  },

  {
    id: 4,
    intent: "shipping",
    content: `
Delayed Shipment Handling

Orders may experience delays due to:
- Weather disruptions
- Customs clearance
- High seasonal demand
- Courier partner issues

If a package is delayed for more than 7 business days, customers may raise a shipping investigation request.

Packages marked as delivered but not received should be reported within 48 hours.
`
  },

  {
    id: 5,
    intent: "after_sales",
    content: `
Warranty & Replacement Policy

Electronics products include a 1-year limited warranty covering manufacturing defects.
Physical damage caused by accidental drops or water exposure is not covered.

Replacement requests are reviewed after product inspection.
Customers must provide product images and order IDs while requesting replacements.
`
  },

  {
    id: 6,
    intent: "after_sales",
    content: `
Product Return Guidelines

Products can be returned within 10 days of delivery if unused and in original packaging.

Returned products undergo quality inspection before refunds are initiated.
Products missing accessories or packaging materials may fail return validation.

Return pickup requests are scheduled within 2-3 business days after approval.
`
  },

  {
    id: 7,
    intent: "technical",
    content: `
Mobile App Troubleshooting

If the app crashes repeatedly:
1. Restart the application
2. Clear cache
3. Update to the latest version
4. Check internet connection

Login failures may occur due to expired sessions or incorrect credentials.

Customers experiencing persistent crashes should contact technical support with screenshots and device information.
`
  },

  {
    id: 8,
    intent: "technical",
    content: `
Payment Failure Troubleshooting

Failed payments may happen because of:
- Bank downtime
- OTP timeout
- Slow internet connection
- Card verification failure

Customers should avoid retrying multiple times rapidly to prevent duplicate deductions.

If money is deducted but the order is not created, the transaction is automatically reversed within 5 business days.
`
  },

  {
    id: 9,
    intent: "technical",
    content: `
Notification Sync Issues

Push notifications may be delayed on battery optimization enabled devices.

Android users should disable battery restrictions for real-time alerts.
iPhone users should ensure notification permissions are enabled in device settings.

Notification sync usually restores automatically after app restart.
`
  },

  {
    id: 10,
    intent: "account",
    content: `
Profile & Account Settings

Users can update profile photos, passwords, addresses, and contact information from Account Settings.

Supported image formats for profile pictures:
- JPG
- PNG

Large image uploads may fail on slow internet connections.
`
  },

  {
    id: 11,
    intent: "account",
    content: `
Password Reset Procedure

Customers who forget passwords can reset them using OTP verification.

Password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one number

Accounts may be temporarily locked after multiple failed login attempts.
`
  },

  {
    id: 12,
    intent: "account",
    content: `
Two-Factor Authentication Support

Customers can enable two-factor authentication from Security Settings.

OTP codes are delivered through SMS or email.
If OTPs are delayed:
- Check spam folder
- Verify mobile number
- Retry after 60 seconds
`
  },

  {
    id: 13,
    intent: "miscelleneous",
    content: `
General Customer Support Information

Customer support is available Monday to Saturday from 9 AM to 7 PM.

Support channels include:
- Live chat
- Email
- Phone support

Average response time for non-urgent tickets is 24 business hours.
`
  },

  {
    id: 14,
    intent: "miscelleneous",
    content: `
Holiday Sale Information

Orders placed during major sale events may experience slight shipping delays because of increased warehouse load.

Customers are advised to track orders regularly during festival periods.
`
  },

  {
    id: 15,
    intent: "shipping",
    content: `
International Shipping Policy

International shipments may require customs verification.
Customers are responsible for import duties and local taxes where applicable.

Delivery timelines vary depending on destination country and courier availability.
`
  },

  {
    id: 16,
    intent: "billing",
    content: `
Subscription Cancellation Policy

Users can cancel subscriptions anytime before the next billing cycle.

Cancelled subscriptions remain active until the current billing period expires.

Partial refunds are generally not issued for unused subscription periods.
`
  },

  {
    id: 17,
    intent: "after_sales",
    content: `
Service Center Support

Products requiring repair can be submitted at authorized service centers.

Repair timelines depend on spare part availability and product category.

Customers receive SMS updates regarding repair progress.
`
  },

  {
    id: 18,
    intent: "technical",
    content: `
Checkout Page Errors

Checkout issues may occur due to browser cache corruption or unsupported browsers.

Customers should:
- Refresh the page
- Clear browser cache
- Try incognito mode
- Retry using another browser
`
  },

  {
    id: 19,
    intent: "account",
    content: `
Account Deletion Policy

Users can permanently delete accounts from Privacy Settings.

Deleted accounts enter a 30-day recovery period before permanent removal.

Orders and invoices linked to deleted accounts remain archived for compliance purposes.
`
  },

  {
    id: 20,
    intent: "miscelleneous",
    content: `
Community Guidelines

Customers are expected to maintain respectful communication with support staff.

Abusive language, spam, or fraudulent activities may result in account suspension.

Support interactions may be recorded for quality assurance and training purposes.
`
  }
];
export type NavItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
  children?: { label: string; href: string }[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Stock Raw Material", href: "/stock-raw-material" },
  { label: "Cutting Stone", href: "/cutting-stone" },
  { label: "Blocks", href: "/blocks" },
  { label: "Vehicles", href: "/vehicles" },
  { label: "Quotation", href: "/quotation" },
  {
    label: "Bill",
    href: "/bill/normal",
    children: [
      { label: "E-Way Bill", href: "/bill/eway" },
      { label: "Normal Bill", href: "/bill/normal" },
    ],
  },
  { label: "Expenses", href: "/expenses" },
  { label: "Customer Ledger", href: "/customer-ledger" },
  { label: "Audit Log", href: "/audit-log", adminOnly: true },
  { label: "Staff & Users", href: "/users", adminOnly: true },
];

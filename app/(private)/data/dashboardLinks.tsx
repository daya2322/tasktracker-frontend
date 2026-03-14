// Utility to recursively lowercase all hrefs in the menu structure
function lowercaseHrefs(data: SidebarDataType[]): SidebarDataType[] {
  return data.map((sidebar) => ({
    ...sidebar,
    data: sidebar.data.map(lowercaseLinkData)
  }));
}

function lowercaseLinkData(link: LinkDataType): LinkDataType {
  const newLink: LinkDataType = {
    ...link,
    href: typeof link.href === 'string' ? link.href.toLowerCase() : link.href,
  };
  if (link.children && Array.isArray(link.children)) {
    newLink.children = link.children.map(lowercaseLinkData);
  }
  return newLink;
}
import { IconifyIcon } from "@iconify-icon/react/dist/iconify.mjs";

export type SidebarDataType = {
  name?: string;
  data: LinkDataType[];
};

export type LinkDataType = {
  id?: number | string;
  isActive: boolean;
  href: string;
  label: string;
  leadingIcon: IconifyIcon | string;
  trailingIcon?: IconifyIcon | string;
  iconColor?: string;
  permissions?: []
  children?: LinkDataType[];
};

export const initialLinkData: SidebarDataType[] = lowercaseHrefs([
  {
    data: [
      {
        isActive: false,
        href: "/dashboard",
        label: "Dashboard",
        leadingIcon: "material-symbols:dashboard",
        trailingIcon: "mdi-light:chevron-right",
        iconColor: "text-yellow-400",
        children: [
          {
            isActive: false,
            href: "/dashboard",
            label: "Dashboard",
            leadingIcon: "material-symbols:dashboard",
            iconColor: "text-yellow-400",
          },
        ]
    }
    ],
  },
]);

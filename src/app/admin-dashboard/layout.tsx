import SideNav from "@/components/admin-dashboard/SideNav";

export default function AdminDashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex">
			<SideNav />
			<div className="w-full max-w-[calc(100vw - 20rem] overflow-hidden">
				{children}
			</div>
		</div>
	);
}

import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import games from "@/assets/badge/games.png";
import garden from "@/assets/badge/garden.png";
import book from "@/assets/badge/book.png";
import home from "@/assets/badge/home.png";
import journal from "@/assets/badge/journal.png";
import trophy from "@/assets/badge/trophy.png";
import profile from "@/assets/badge/profile.png";
import cat from "@/assets/decors/sitting_cat.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/home", icon: home },
  { title: "My Library", url: "/library", icon: book },
  { title: "Reading Journal", url: "/journal", icon: journal },
  { title: "Garden", url: "/garden", icon: garden },
  { title: "Achievements", url: "/achievements", icon: trophy },
  { title: "Games", url: "/games", icon: games },
  { title: "Profile", url: "/profile", icon: profile },
];

// Colors for this sidebar only (same cream and green as your login card)
const paperTheme = {
  "--sidebar": "#faf3e6",
  "--sidebar-foreground": "#3f372f",
  "--sidebar-accent": "#f1e7d3",
  "--sidebar-accent-foreground": "#3f372f",
  "--sidebar-border": "#e3d6c2",
};

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <Sidebar style={paperTheme}>
      <SidebarHeader className="px-5 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <img src={book} alt="" className="h-9 w-auto" />
          <div className="leading-tight">
            <p className="font-serif text-xl text-[#3f372f]">Books of Sophia</p>
            <p className="font-serif text-xs italic text-[#8a7f72]">
              your reading world
            </p>
          </div>
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[#d9c9ae] to-transparent" />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b9276]">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link to={item.url} />}
                    isActive={location.pathname === item.url}
                    className="h-11 gap-3 rounded-xl px-3 font-serif text-[15px] text-[#51483f] transition hover:bg-[#f1e7d3] data-[active=true]:bg-[#e5e8d9] data-[active=true]:font-semibold data-[active=true]:text-[#4f5f3f] data-[active=true]:shadow-[inset_0_1px_3px_rgba(90,110,70,0.15)]"
                  >
                    <img
                      src={item.icon}
                      alt=""
                      className="size-6 shrink-0 object-contain"
                    />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Cat and quote */}
      <div className="mx-4 mb-3 rounded-2xl border border-dashed border-[#d9c9ae] bg-[#fffaf0]/70 px-4 pb-4 pt-3 text-center">
        <img
          src={cat}
          alt=""
          className="mx-auto mb-2 h-14 w-auto object-contain"
        />
        <p className="font-serif text-xs italic leading-5 text-[#75695e]">
          &ldquo;A good book is a happy place.&rdquo;
        </p>
      </div>

      <SidebarFooter className="px-3 pb-4">
        <div className="mb-2 h-px bg-gradient-to-r from-transparent via-[#d9c9ae] to-transparent" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-10 gap-3 rounded-xl px-3 font-serif text-[#75695e] hover:bg-[#f1e7d3] hover:text-[#3f372f]"
            >
              <LogOut className="size-5" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
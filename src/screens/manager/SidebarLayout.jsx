import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BarChart3, Bell, BookLock, ClipboardList, FolderOpen, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldAlert, Users, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/AuthContext';
import { useIncidents } from '../../hooks/useIncidents';

const NAV_ITEMS=[['Dashboard',LayoutDashboard,'/'],['Incidents',FolderOpen,'/incidents'],['CAPA Registry',ClipboardList,'/capa'],['Analytics',BarChart3,'/analytics'],['Team Directory',Users,'/team'],['Policies',BookLock,'/policies'],['Settings',Settings,'/settings']];

export default function SidebarLayout(){
  const navigate=useNavigate(),location=useLocation(),{profile}=useAuth(),{incidents}=useIncidents();
  const [search,setSearch]=useState(''),[open,setOpen]=useState(false);
  const pending=incidents.filter(i=>i.status==='manager_review'&&i.escalation_status!=='open').length;
  const go=path=>{navigate(path);setOpen(false)};
  const submit=e=>{e.preventDefault();if(search.trim())navigate(`/incidents?q=${encodeURIComponent(search.trim())}`)};
  const logout=async()=>{await supabase.auth.signOut();navigate('/login')};
  return <div className="portal-layout">
    <button className="mobile-menu" aria-label="Open navigation" onClick={()=>setOpen(true)}><Menu/></button>{open&&<button className="nav-backdrop" aria-label="Close navigation" onClick={()=>setOpen(false)}/>}<aside className={`portal-sidebar ${open?'open':''}`}><div className="brand"><div><ShieldAlert/></div><span><b>SafeGuard Pro</b><small>MANAGER PORTAL</small></span><button aria-label="Close navigation" onClick={()=>setOpen(false)}><X/></button></div><nav aria-label="Primary navigation">{NAV_ITEMS.map((item,index)=><NavEntry key={item[2]} item={item} index={index} active={location.pathname===item[2]} onClick={go}/>)}</nav><div className="sidebar-user"><div className="avatar">{profile?.full_name?.[0]||'M'}</div><span><b>{profile?.full_name||'Manager'}</b><small>{profile?.department||'HSE Manager'}</small></span></div><button className="logout" onClick={logout}><LogOut size={16}/>Sign out</button></aside>
    <div className="portal-main"><header className="portal-topbar"><form onSubmit={submit} className="global-search"><Search size={16}/><label className="sr-only" htmlFor="global-search">Global search</label><input id="global-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search incidents, references, reporters…"/></form><span className="live-indicator"><i/>Live</span><button className="icon-button" aria-label={`${pending} incidents awaiting manager review`} onClick={()=>navigate('/incidents?status=manager_review')}><Bell size={17}/>{pending>0&&<b>{pending}</b>}</button><div className="avatar">{profile?.full_name?.[0]||'M'}</div></header><main id="main-content" className="portal-content"><Outlet/></main></div>
  </div>;
}

function NavEntry({item,index,active,onClick}) { const [label,NavIcon,path]=item; return <div>{index===0&&<small>CORE</small>}{index===4&&<small>ADMIN</small>}<button className={active?'active':''} onClick={()=>onClick(path)}><NavIcon size={17}/>{label}</button></div>; }

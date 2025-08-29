import React from "react";

export default function ProfilePanel({ profile, setProfile, theme, setTheme }) {
  return (
    <section className="col-span-12">
      <div className="grid grid-cols-12 gap-3 md:gap-4">
        <div className="col-span-12 lg:col-span-4 rounded-2xl border bg-bg-soft p-4">
          <div className="flex items-center gap-3">
            <img src={profile.avatar} className="h-16 w-16 rounded-2xl" alt="shop avatar" />
            <div>
              <div className="font-bold text-lg">{profile.shopName}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">Owner: {profile.owner}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Hours: {profile.hours}</div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div><span className="text-neutral-500">Phone:</span> {profile.phone}</div>
            <div><span className="text-neutral-500">GSTIN:</span> {profile.gstin || '-'}</div>
            <div><span className="text-neutral-500">Address:</span> {profile.address}</div>
          </div>
          <div className="mt-4">
            <button onClick={() => { localStorage.clear(); location.reload(); }} className="text-sm px-3 py-2 rounded-xl border bg-bg-soft hover:bg-bg-muted">
              Reset demo data
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 rounded-2xl border bg-bg-soft p-4">
          <div className="font-semibold mb-2">Edit Profile & Theme</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-xs text-neutral-600">Shop Name</label><input value={profile.shopName} onChange={(e)=>setProfile({...profile, shopName:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"/></div>
            <div><label className="text-xs text-neutral-600">Owner</label><input value={profile.owner} onChange={(e)=>setProfile({...profile, owner:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"/></div>
            <div><label className="text-xs text-neutral-600">Phone</label><input value={profile.phone} onChange={(e)=>setProfile({...profile, phone:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"/></div>
            <div><label className="text-xs text-neutral-600">GSTIN</label><input value={profile.gstin} onChange={(e)=>setProfile({...profile, gstin:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"/></div>
            <div><label className="text-xs text-neutral-600">Hours</label><input value={profile.hours} onChange={(e)=>setProfile({...profile, hours:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"/></div>
            <div className="md:col-span-2"><label className="text-xs text-neutral-600">Address</label><textarea value={profile.address} onChange={(e)=>setProfile({...profile, address:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700" rows={3} /></div>
            <div className="md:col-span-2"><label className="text-xs text-neutral-600">Avatar URL</label><input value={profile.avatar} onChange={(e)=>setProfile({...profile, avatar:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"/></div>
            <div className="md:col-span-2">
              <label className="text-xs text-neutral-600">Theme</label>
              <div className="mt-1 inline-flex gap-2">
                <button onClick={()=>setTheme('light')} className={`px-3 py-1 rounded-lg border ${theme==='light' ? 'bg-accent-red text-white border-orange-500' : ''}`}>Light</button>
                <button onClick={()=>setTheme('dark')} className={`px-3 py-1 rounded-lg border ${theme==='dark' ? 'bg-accent-red text-white border-orange-500' : ''}`}>Dark</button>
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-green-700 dark:text-green-400">Changes auto-save.</div>
        </div>
      </div>
    </section>
  );
}

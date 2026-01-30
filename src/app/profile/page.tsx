"use client";
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

// Firestore + Storage helpers (you should export these from your /firebase module)
// import { db, storage } from '@/firebase'
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/firestore"; // <-- make sure you export these

// Default fallback image (local asset you uploaded)
const defaultAvatar = "/mnt/data/b5db78fd-f64b-4589-b343-f53bcdd7d910.png";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // form state (basic + location + bank + aadhar)
  const [form, setForm] = useState({
    artisanName: "",
    state: "",
    district: "",
    tehsil: "",
    block: "",
    village: "",
    gender: "",
    category: "",
    artisanType: "",
    bankName: "",
    bankAccount: "",
    ifsc: "",
    aadharNumber: "",
    bio: "",
    avatarUrl: "",
    aadharUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const avatarPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user) return;
    // load profile from Firestore (collection `profiles`, doc = uid)
    const load = async () => {
      setLoadingProfile(true);
      try {
        const d = doc(db, "profiles", user.uid);
        const snap = await getDoc(d);
        if (snap.exists()) {
          const data = snap.data();
          setForm((f) => ({ ...f, ...data }));
        } else {
          // if no profile exists, prefill with auth data
          setForm((f) => ({
            ...f,
            artisanName: user.displayName || "",
            avatarUrl: user.photoURL || defaultAvatar,
          }));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    // cleanup preview object URLs
    return () => {
      if (avatarPreviewRef.current && typeof avatarPreviewRef.current === 'string' && avatarPreviewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewRef.current);
      }
    };
  }, []);

  if (isUserLoading || loadingProfile) return <p>Loading...</p>;
  if (!user) return null;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Avatar must be an image file");
      return;
    }
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    avatarPreviewRef.current = url;
    setForm((s) => ({ ...s, avatarUrl: url }));
  };

  const onAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    // allow images or PDFs
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Aadhaar upload must be an image or PDF");
      return;
    }
    setAadharFile(file);
  };

  const validate = () => {
    if (!form.artisanName.trim()) return "Artisan name is required.";
    if (form.bankAccount && !/^[0-9]{6,20}$/.test(form.bankAccount)) return "Bank account looks invalid.";
    if (form.ifsc && !/^[A-Z]{4}0[0-9A-Z]{6}$/.test(form.ifsc)) return "IFSC looks invalid (format).";
    if (form.aadharNumber && !/^[0-9]{12}$/.test(form.aadharNumber)) return "Aadhaar must be 12 digits.";
    return null;
  };

  const handleSave = async () => {
    setError("");
    const v = validate();
    if (v) return setError(v);

    setSaving(true);
    try {
      const updates = { ...form };

      // If avatarFile present, upload to Storage and replace avatarUrl with download URL
      if (avatarFile) {
        const sRef = storageRef(storage, `profiles/${user.uid}/avatar-${Date.now()}`);
        await uploadBytes(sRef, avatarFile);
        const url = await getDownloadURL(sRef);
        updates.avatarUrl = url;
      }

      // If aadhar file present, upload and add aadharUrl
      if (aadharFile) {
        const sRef = storageRef(storage, `profiles/${user.uid}/aadhar-${Date.now()}`);
        await uploadBytes(sRef, aadharFile);
        const url = await getDownloadURL(sRef);
        updates.aadharUrl = url;
      }

      // write to Firestore
      const d = doc(db, "profiles", user.uid);
      await setDoc(d, updates, { merge: true });

      // Optionally update Firebase Auth profile displayName / photoURL
      try {
        if (updates.artisanName || updates.avatarUrl) {
          // note: updateProfile comes from firebase/auth and requires auth.currentUser
          // you can call updateProfile(auth.currentUser, {...}) in your firebase module
        }
      } catch (e) {
        console.warn("Auth profile update failed", e);
      }

      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center space-x-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={form.avatarUrl || defaultAvatar} alt={form.artisanName || user.displayName || "avatar"} />
          <AvatarFallback>{(form.artisanName || user.displayName || user.email || "U").charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{form.artisanName || user.displayName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mt-8 bg-white border rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Personal & Location Details</h2>
        {error && <div className="p-2 mb-4 text-red-700 bg-red-50 rounded">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm mb-1">State</div>
            <input name="state" value={form.state} onChange={onChange} className="w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <div className="text-sm mb-1">District</div>
            <input name="district" value={form.district} onChange={onChange} className="w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <div className="text-sm mb-1">Sub-District/Tehsil</div>
            <input name="tehsil" value={form.tehsil} onChange={onChange} className="w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <div className="text-sm mb-1">Block</div>
            <input name="block" value={form.block} onChange={onChange} className="w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <div className="text-sm mb-1">Village</div>
            <input name="village" value={form.village} onChange={onChange} className="w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <div className="text-sm mb-1">Artisan Name</div>
            <input name="artisanName" value={form.artisanName} onChange={onChange} className="w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <div className="text-sm mb-1">Gender</div>
            <select name="gender" value={form.gender} onChange={onChange} className="w-full rounded border px-3 py-2">
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </label>

          <label className="block">
            <div className="text-sm mb-1">Category</div>
            <select name="category" value={form.category} onChange={onChange} className="w-full rounded border px-3 py-2">
              <option value="">Select</option>
              <option>SC</option>
              <option>ST</option>
              <option>OBC</option>
              <option>General</option>
            </select>
          </label>

          <label className="block col-span-1 sm:col-span-2">
            <div className="text-sm mb-1">Artisan Type</div>
            <select name="artisanType" value={form.artisanType} onChange={onChange} className="w-full rounded border px-3 py-2">
              <option value="">Select</option>
              <option>Potter</option>
              <option>Weaver</option>
              <option>Sculptor</option>
              <option>Other</option>
            </select>
          </label>

          <label className="block col-span-1 sm:col-span-2">
            <div className="text-sm mb-1">Bio</div>
            <Textarea name="bio" value={form.bio} onChange={onChange} rows={3} />
          </label>
        </div>

        <hr className="my-4" />

        <h3 className="text-md font-semibold mb-2">Bank Details (optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label>
            <div className="text-sm mb-1">Bank Name</div>
            <input name="bankName" value={form.bankName} onChange={onChange} className="w-full rounded border px-3 py-2" />
          </label>
          <label>
            <div className="text-sm mb-1">Account Number</div>
            <input name="bankAccount" value={form.bankAccount} onChange={onChange} className="w-full rounded border px-3 py-2" />
          </label>
          <label>
            <div className="text-sm mb-1">IFSC</div>
            <input name="ifsc" value={form.ifsc} onChange={onChange} className="w-full rounded border px-3 py-2" />
          </label>
        </div>

        <hr className="my-4" />

        <h3 className="text-md font-semibold mb-2">Aadhaar (optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <label>
            <div className="text-sm mb-1">Aadhaar Number</div>
            <input name="aadharNumber" value={form.aadharNumber} onChange={onChange} className="w-full rounded border px-3 py-2" />
          </label>

          <label>
            <div className="text-sm mb-1">Upload Aadhaar (image / PDF)</div>
            <input type="file" accept="image/*,application/pdf" onChange={onAadharChange} className="w-full" />
          </label>
        </div>

        <hr className="my-4" />

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={onAvatarChange} />
            <span className="text-sm">Change avatar</span>
          </label>

          <Button onClick={handleSave} disabled={saving} className="ml-auto">
            {saving ? "Saving..." : "Save profile"}
          </Button>

          <Button variant="ghost" onClick={() => setIsEditing((s) => !s)}>
            {isEditing ? "Close" : "Edit"}
          </Button>
        </div>

      </div>

      <section className="mt-6">
        <h2 className="text-lg font-medium mb-2">Preview</h2>
        <div className="border rounded p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-1">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border">
              <img src={form.avatarUrl || defaultAvatar} alt="avatar preview small" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="font-semibold text-lg">{form.artisanName || 'Your name'}</div>
            <div className="text-sm text-muted-foreground">{[form.village, form.block, form.district, form.state].filter(Boolean).join(', ') || 'Location'}</div>
            <p className="mt-2">{form.bio || 'Your bio will appear here.'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

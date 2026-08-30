import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 items-start justify-center">
      <UserProfile routing="hash" />
    </div>
  );
}

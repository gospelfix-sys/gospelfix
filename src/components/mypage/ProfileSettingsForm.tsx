"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileSettingsFormProps {
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

// "프로필설정" 페이지 전용 — 이름/아바타만 다룬다. 계정(로그인 이메일 확인, 비밀번호,
// 회원탈퇴)은 /mypage/settings의 AccountSettingsCards로 분리됐다.
export function ProfileSettingsForm({ email, fullName, avatarUrl }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
  }

  function handleRemoveAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      let nextAvatarUrl: string | null = avatarUrl;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await axiosInstance.post<{ avatarUrl: string }>(
          "/auth/avatar",
          formData,
          { headers: { "Content-Type": undefined }, timeout: 30000 },
        );
        nextAvatarUrl = uploadRes.data.avatarUrl;
      } else if (removeAvatar) {
        nextAvatarUrl = null;
      }

      await axiosInstance.patch("/auth/me", { fullName: name, avatarUrl: nextAvatarUrl });
      toast.success("프로필이 저장되었습니다.");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "프로필 저장에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">프로필 이미지</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar size="lg">
              {avatarPreview && <AvatarImage src={avatarPreview} alt={name} />}
              <AvatarFallback>{(name || email).charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {avatarPreview && (
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                onClick={handleRemoveAvatar}
                aria-label="프로필 이미지 제거"
                className="absolute -right-1.5 -top-1.5 rounded-full bg-card"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            최적 사이즈 200×200 / 파일형식 JPG, PNG, WEBP
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              불러오기
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={!avatarPreview}
            >
              삭제
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarPick}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-medium">
              이름
            </label>
            <Input id="fullName" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              이메일
            </label>
            <Input id="email" value={email} disabled />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "변경사항 저장"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AccountSettingsCardsProps {
  email: string;
}

// "설정" 개요 페이지 전용 — 프로필(이름/아바타)은 /mypage(프로필 페이지)의
// ProfileSettingsForm으로 분리됐고, 여기는 계정 자체에 대한 설정(로그인 계정 확인,
// 비밀번호 변경, 회원탈퇴)만 다룬다.
export function AccountSettingsCards({ email }: AccountSettingsCardsProps) {
  const { signOut } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [confirmEmail, setConfirmEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleChangePassword() {
    if (newPassword !== newPasswordConfirm) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    setChangingPassword(true);
    try {
      await axiosInstance.post("/auth/password", { currentPassword, newPassword });
      toast.success("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (error) {
      toast.error(getErrorMessage(error, "비밀번호 변경에 실패했습니다."));
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await axiosInstance.delete("/auth/me", { data: { currentPassword: deletePassword } });
      toast.success("탈퇴 처리가 완료되었습니다.");
      await signOut("/");
    } catch (error) {
      toast.error(getErrorMessage(error, "회원탈퇴 처리에 실패했습니다."));
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">계정 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">로그인 계정</span>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {email}
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">비밀번호 변경</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              현재 비밀번호
            </label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-sm font-medium">
              새 비밀번호
            </label>
            <Input
              id="newPassword"
              type="password"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="newPasswordConfirm" className="text-sm font-medium">
              새 비밀번호 확인
            </label>
            <Input
              id="newPasswordConfirm"
              type="password"
              minLength={6}
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword}
          >
            {changingPassword ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">위험 구역</CardTitle>
          <CardDescription>
            회원탈퇴 시 로그인이 영구적으로 차단됩니다. 결제/리뷰 기록은 법적 보관 목적으로 유지되며
            되돌릴 수 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger render={<Button type="button" variant="destructive" />}>
              <Trash2 className="h-4 w-4" />
              회원탈퇴
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>정말 탈퇴하시겠어요?</DialogTitle>
                <DialogDescription>
                  이 작업은 되돌릴 수 없습니다. 확인을 위해 가입 이메일(
                  <strong>{email}</strong>)과 현재 비밀번호를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Input
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={email}
                />
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="현재 비밀번호"
                />
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>취소</DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={confirmEmail.trim() !== email || !deletePassword || deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? "처리 중..." : "탈퇴 확정"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

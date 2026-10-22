"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Trash2 } from "lucide-react";
import axiosInstance, { isAxiosError } from "@/lib/axios/instance";
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
  role: "user" | "admin" | "seller";
  sellerRequestedAt: string | null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response) {
    const data = error.response.data as { error?: string } | undefined;
    return data?.error ?? fallback;
  }
  return fallback;
}

// "설정" 개요 페이지 전용 — 프로필(이름/아바타)은 /mypage(프로필 페이지)의
// ProfileSettingsForm으로 분리됐고, 여기는 계정 자체에 대한 설정(로그인 계정 확인,
// 비밀번호 변경, 회원탈퇴)만 다룬다.
export function AccountSettingsCards({
  email,
  role,
  sellerRequestedAt,
}: AccountSettingsCardsProps) {
  const { signOut } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [confirmEmail, setConfirmEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [requested, setRequested] = useState(sellerRequestedAt !== null);
  const [requestingSeller, setRequestingSeller] = useState(false);

  async function handleSellerRequest() {
    setRequestingSeller(true);
    try {
      await axiosInstance.post("/auth/seller-request");
      setRequested(true);
      toast.success("판매자 신청이 접수되었습니다. 검토 후 전환해드릴게요.");
    } catch (error) {
      toast.error(getErrorMessage(error, "판매자 신청에 실패했습니다."));
    } finally {
      setRequestingSeller(false);
    }
  }

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

      {role === "user" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">판매자 전환</CardTitle>
            <CardDescription>
              직접 만든 작품을 등록하고 판매하고 싶다면 신청해주세요. 검토 후 관리자가 직접
              승인해드립니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requested ? (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                신청 완료 — 검토 중입니다.
              </div>
            ) : (
              <Button onClick={handleSellerRequest} disabled={requestingSeller}>
                {requestingSeller ? "신청 중..." : "판매자 신청"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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

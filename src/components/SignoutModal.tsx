"use client";
import { FC } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

interface SignoutModalProps {
  onClose: () => void;
}

const SignoutModal: FC<SignoutModalProps> = ({ onClose }) => {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex absolute inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="p-6 w-full max-w-sm bg-white border-4 border-black shadow-brutal">
        <h3 className="mb-4 text-xl font-black text-black">CONFIRM SIGN OUT</h3>
        <p className="mb-6 font-bold text-black">
          Are you sure you want to sign out?
        </p>
        <div className="flex gap-4">
          <button
            className="flex-1 px-4 py-2 font-bold text-white bg-red-500 border-4 border-black transition-colors hover:bg-red-600 shadow-brutal-sm"
            onClick={() => void signOut()}>
            YES, SIGN OUT
          </button>
          <button
            className="flex-1 px-4 py-2 font-bold text-black bg-white border-4 border-black transition-colors hover:bg-gray-100 shadow-brutal-sm"
            onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
export default SignoutModal;

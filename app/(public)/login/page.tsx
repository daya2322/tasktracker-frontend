"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/customButton";
import CustomPasswordInput from "../../components/customPasswordInput";
import CustomTextInput from "../../components/CustomTextInput";
import Logo from "../../components/logo";
import { useAuth } from "@/app/components/contexts/authContect";

const LoginSchema = Yup.object({
  userId: Yup.string().required("User ID is required"),
  password: Yup.string()
    .min(6, "Password too short")
    .required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  // ✅ Redirect safely
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-[#4A90E2] to-[#1565C0] p-4">
      <div className="bg-white w-full max-w-[420px] rounded-xl shadow-xl p-10">
        <div className="flex justify-center mb-6">
          <Logo type="full" width={120} height={120} />
        </div>

        <h2 className="text-center text-3xl font-semibold text-gray-900 mb-8">
          Login
        </h2>

        <Formik
          initialValues={{ userId: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setErrors }) => {
            const res = await login({
              email: values.userId,
              password: values.password,
            });

            if (res?.error) {
              setErrors({ userId: res.data.message });
              return;
            }

            router.replace("/dashboard");
          }}
        >
          {({ isSubmitting, handleChange, values }) => (
            <Form className="flex flex-col gap-6">
              <CustomTextInput
                label="Email or Username"
                placeholder="Email or Username"
                value={values.userId}
                onChange={handleChange("userId")}
              />
              <ErrorMessage
                name="userId"
                component="p"
                className="text-red-500 text-xs"
              />

              <CustomPasswordInput
                label="Password"
                value={values.password}
                onChange={handleChange("password")}
              />
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-xs"
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

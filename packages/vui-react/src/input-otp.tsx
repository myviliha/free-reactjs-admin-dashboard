"use client";

import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";
import {
  INPUT_OTP_CARET,
  INPUT_OTP_CARET_WRAP,
  INPUT_OTP_CONTAINER,
  INPUT_OTP_GROUP,
  INPUT_OTP_INPUT,
  INPUT_OTP_SLOT,
} from "./class-variants";
import { Minus as MinusIcon } from "./icons";
import { cn } from "./utils";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(INPUT_OTP_CONTAINER, containerClassName)}
      className={cn(INPUT_OTP_INPUT, className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-otp-group" className={cn(INPUT_OTP_GROUP, className)} {...props} />;
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(INPUT_OTP_SLOT, className)}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className={INPUT_OTP_CARET_WRAP}>
          <div className={INPUT_OTP_CARET} />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon className="vui-icon-plain" />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };

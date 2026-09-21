import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from "@chakra-ui/react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea,
  size: _,
  ...props
}) => {
  const [field, { error }] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={props.name}>{label}</FormLabel>
      <Input
        as={textarea ? Textarea: null}
        {...field}
        {...props}
        id={props.name}
        placeholder={props.placeholder}
      />
      { error ? <FormErrorMessage>{ error }</FormErrorMessage> : null}
    </FormControl>
  );
};
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import "../style/Login.scss";
import { login } from "../api/login";
import { LoginRequestDto } from '@common/dto/login.dto';
const schema = yup.object({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});


const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginRequestDto>({
    resolver: yupResolver(schema),
    mode: "onChange", // Validate on change for better UX
  });

  const onSubmit = (data: LoginRequestDto) => {
    setLoading(true);
    login(data.email, data.password).then((response) => {
      console.log(response);
      setLoading(false);
      localStorage.setItem("token", response.token);
      navigate("/");
    }).catch((error) => {
      console.error(error);
      setLoading(false);
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
        <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
          <div className="input-group">
            <input
              type="email"
              autoComplete="new-password"
              placeholder="Email"
              {...register("email")}
              className={errors.email ? "error-input" : ""}
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Password"
                {...register("password")}
                className={errors.password ? "error-input" : ""}
              />
             
            </div>
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <div className="button-group">
            <button type="submit" disabled={!isValid || loading} className="submit-button">
              {loading ? "Logging in..." : "Login"}
            </button>
            <button type="button" onClick={() => navigate("/")} className="back-button">
              Go back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

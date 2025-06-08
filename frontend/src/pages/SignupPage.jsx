// frontend2/src/pages/SignupPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/useToast';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const signupSchema = z.object({
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters").min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm password is required"), // Added confirmPassword
    role: z.enum(['user', 'moderator'], { message: "Invalid role selected" }),
    // skills will be a string from the input, we'll parse it to an array later
    skills: z.string().optional(), // Initially optional for all
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Error message will appear on the confirmPassword field
})
.superRefine((data, ctx) => {
    // Conditional validation for skills based on role
    if (data.role === 'moderator') {
        const skillsArray = data.skills?.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (!skillsArray || skillsArray.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Skills are required for moderators (comma-separated)",
                path: ["skills"],
            });
        }
    }
});


export default function SignupPage() {
    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        watch // Use watch to get the current value of fields
    } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '', // Added to default values
            role: 'user',
            skills: '', // Added to default values
        },
    });

    const watchedRole = watch('role'); // Watch the 'role' field to conditionally render 'skills'

    const navigate = useNavigate();
    const showToast = useToast();

    const onSubmit = async (data) => {
        try {
            // Destructure relevant fields, excluding confirmPassword
            const { email, password, role, skills } = data; 
            
            const payload = { email, password, role };

            // Conditionally add skills if the role is moderator and skills are provided
            if (role === 'moderator' && skills) {
                // Convert comma-separated string to an array of trimmed strings
                payload.skills = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
            }

            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), // Send the prepared payload
            });
            const result = await response.json();

            if (response.ok) {
                showToast('Account created successfully! Please log in.', 'success');
                navigate('/login');
            } else {
                showToast(result.message || 'Signup failed!', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showToast('Network error, please try again.', 'error');
        }
    };

    return (
        <div className="hero min-h-screen bg-base-100">
            <div className="hero-content flex-col lg:flex-row">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold text-secondary">Join Us Now!</h1>
                    <p className="py-6">Create your account to start managing tickets seamlessly. Fast, easy, and secure.</p>
                </div>
                <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-300">
                    <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                                {...register("email")}
                            />
                            {errors.email && <label className="label"><span className="label-text-alt text-error">{errors.email.message}</span></label>}
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="password"
                                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                                {...register("password")}
                            />
                            {errors.password && <label className="label"><span className="label-text-alt text-error">{errors.password.message}</span></label>}
                        </div>
                        {/* Confirm Password Field */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Confirm Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="confirm password"
                                className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && <label className="label"><span className="label-text-alt text-error">{errors.confirmPassword.message}</span></label>}
                        </div>
                        
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Select Role</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.role ? 'select-error' : ''}`}
                                {...register("role")}
                            >
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                            </select>
                            {errors.role && <label className="label"><span className="label-text-alt text-error">{errors.role.message}</span></label>}
                        </div>

                        {/* Skills Input - Conditionally Rendered */}
                        {watchedRole === 'moderator' && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Skills (comma-separated, e.g., React, Node.js)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Frontend, React, JavaScript"
                                    className={`input input-bordered w-full ${errors.skills ? 'input-error' : ''}`}
                                    {...register("skills")}
                                />
                                {errors.skills && <label className="label"><span className="label-text-alt text-error">{errors.skills.message}</span></label>}
                            </div>
                        )}

                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-secondary w-full">Sign Up</button>
                        </div>
                        <p className="text-center mt-4">
                            Already have an account? <Link to="/login" className="link link-hover text-secondary">Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
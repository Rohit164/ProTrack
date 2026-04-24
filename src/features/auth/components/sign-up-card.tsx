import React from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { useForm } from 'react-hook-form';
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import Link from 'next/link';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { DottedSeparator } from "@/components/dotted-separator"
import { Card,CardContent , CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRegister } from '../api/use-register';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/rpc';



const formSchema = z.object({
    name: z.string().trim().min(3, "Name must be at least 3 characters"),
    email : z.string().email(),
    password : z.string().min(8,"Minimum 8 characters"),
});


export const SignUpCard = () => {
    const router = useRouter();
    const register = useRegister();
    
    const form = useForm<z.infer<typeof formSchema >>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                name:"",
                email: "",
                password: "",
            },
        });
    
    const onSubmit = async (values: z.infer<typeof formSchema>) =>{
            console.log({ values });

            try {
                await register.mutateAsync({
                    json: values
                });
                router.push('/'); // or wherever you want to redirect after registration
            } catch (error) {
                console.error('Registration failed:', error);
                form.setError('root', {
                    type: 'manual',
                    message: 'Registration failed. Please try again.'
                });
            }
        }
    return(
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">
                    Sign Up
                </CardTitle>
                <CardDescription>
                    By Signing up, you agree to our {""}
                    <Link href="/privacy">
                    <span className="text-blue-700">
                        Privacy Policy
                    </span>
                    </Link> {""}
                    and {""}
                    <Link href="/terms">
                    <span className="text-blue-700">
                        Terms of Service
                    </span>
                    </Link>
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                    <FormField 
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                    <Input    
                                        {...field}                   
                                        type="text"
                                        placeholder="Enter your name"                       
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                       
                                )}
                            />
                       <FormField 
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                    <Input    
                                        {...field}                   
                                        type="email"
                                        placeholder="Enter email address"                       
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                       
                                )}
                            />
                         <FormField 
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                    <Input    
                                        {...field}                   
                                        type="passwprd"
                                        placeholder="Enter your password"                       
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                       
                                )}
                            />
                        <Button disabled={register.isPending} size="lg" className="w-full">
                        {register.isPending ? "Creating account..." : "Sign Up"}
                        </Button>
                        {form.formState.errors.root && (
                            <p className="text-red-500 text-sm">
                                {form.formState.errors.root.message}
                            </p>
                        )}
                    </form>
                </Form>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button 
                    disabled={false}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                >                   
                    <FcGoogle className="mr-2" />
                    Login with Google
                </Button>
                <Button 
                    disabled={false}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                >                  
                    <FaGithub className="mr-2 size-5" />
                    Login with Github
                </Button>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7 flex items-center justify-center">
                    <p>
                        Already have an account
                        <Link href= "/sign-in">
                            <span className="text-blue-700">&nbsp;
                                Sign In
                            </span>
                        </Link>
                    </p>
            </CardContent>
        </Card>
    )
}
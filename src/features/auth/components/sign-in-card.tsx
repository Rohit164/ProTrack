// signin card


import React from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import {z} from "zod";
import Link from 'next/link';
import {zodResolver} from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card,CardContent , CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Value } from '@radix-ui/react-select';
import { useLogin } from '../api/use-login';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    email : z.string().email(),
    password : z.string().min(1,"Required"),
});

export const SignInCard = () => {
    const router = useRouter();
    const login = useLogin();
    
    const form = useForm<z.infer<typeof formSchema >>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) =>{
        console.log({ values });
        try {
            await login.mutateAsync({
                json: values
            });
            router.push('/'); // or wherever you want to redirect after login
        } catch (error) {
            console.error('Login failed:', error);
            // Handle error appropriately - you might want to show an error message
            form.setError('root', {
                type: 'manual',
                message: 'Invalid email or password'
            });
        }
    }


    return(
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">
                    Welcome Back!
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> 
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
                                type="password"
                                placeholder="Enter password"                       
                                />
                            </FormControl>
                           <FormMessage />
                        </FormItem>

                        )}
                    />
                    <Button 
                            disabled={login.isPending} 
                            size="lg" 
                            className="w-full"
                        >
                         {login.isPending ? "Logging in..." : "Login"}
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
                        Don&apos;t have an account
                        <Link href= "/sign-up">
                            <span className="text-blue-700">&nbsp;
                                Sign Up
                            </span>
                        </Link>
                    </p>
            </CardContent>
        </Card>
    );
};
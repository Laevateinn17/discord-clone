import { NextRequest, NextResponse } from "next/server";
import { useAuth } from "./contexts/auth.context";



export default function middleware(request: NextRequest) {
    // const {user} = useAuth();

    // console.log("user is ", user);
    return NextResponse.next();
}
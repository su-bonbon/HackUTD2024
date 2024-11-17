import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import image from "../../public/image.png";
import logo from "../../public/logo.png";

function LandingPage() {
	return (
		<div className="relative h-screen w-screen bg-black dark font-[family-name:var(--font-geist-sans)]">
			<div className="-z-0 absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
			<div className="-z-0 absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#2563eb36,#000)]" />

			<main className="absolute z-10 flex items-center flex-col justify-between h-full pt-8 w-screen text-center">
				<div className="h-20 bg-slate-700/50 border border-slate-700 max-w-2xl w-full rounded-full mb-20 flex items-center px-8 justify-between">
					<div className="flex items-center gap-2">
						<Image src={logo} alt="logo" width={40} height={40} />
						<p className="font-semibold text-2xl text-white">InfoGo</p>
					</div>

					<Button asChild variant={"secondary"} className="bg-slate-700">
						<Link href={"/generate"}>Get Started</Link>
					</Button>
				</div>

				<div className="flex flex-col items-center max-w-xl gap-4">
					<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-white">
						Get Actionable Research in{" "}
						<span className="text-blue-600">Seconds</span>
					</h1>
					<p className="text-xl text-muted-foreground w-[80%">
						Augment your investing workflow with an autonomous agent designed to
						analyze financials and valuate companies.
					</p>

					<Button asChild className="bg-blue-600 text-white hover:bg-blue/80">
						<Link href={"/generate"}>Get Started</Link>
					</Button>
				</div>
				<div className="relative h-96 w-full max-w-2xl rounded-md">
					<Image
						src={image}
						fill
						alt=""
						className="object-contain rounded-md"
					/>
				</div>
			</main>
		</div>
	);
}

export default LandingPage;

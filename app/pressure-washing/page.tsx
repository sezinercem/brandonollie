import { services } from "@/lib/content";
import { ServicePage } from "@/components/service-page";
import { pageMetadata } from "@/lib/metadata";
const service = services[2];
export const metadata = pageMetadata(service.name, service.summary, "/pressure-washing");
export default function Page() { return <ServicePage service={service} />; }

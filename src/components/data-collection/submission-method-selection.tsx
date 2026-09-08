import { motion, useReducedMotion } from "motion/react";
import { IconApi, IconArrowRight, IconUpload, IconMailForward, IconWorld } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const METHODS = [
  { key: "file", path: "/upload", icon: IconUpload, tone: "bg-primary/10 text-primary" },
  { key: "email", path: "/send-template-mail", icon: IconMailForward, tone: "bg-success/10 text-success" },
  { key: "api", path: "/upload?source_type=API", icon: IconApi, tone: "bg-warning/10 text-warning" },
  { key: "web", path: "/upload?source_type=WEB_SCRAPE", icon: IconWorld, tone: "bg-accent text-accent-foreground" },
] as const;

export function SubmissionMethodSelection({ collectionPath }: { collectionPath: string }) {
  const { t } = useTranslation("ingestion");
  const reduceMotion = useReducedMotion();

  return <nav aria-label={t("newSubmission.methodsLabel")}>
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {METHODS.map(({ key, path, icon: Icon, tone }) => <motion.li key={key}
        whileHover={reduceMotion ? undefined : { y: -2 }}
        transition={{ duration: reduceMotion ? 0 : 0.15 }}>
        <Link to={`${collectionPath}${path}`}
          aria-labelledby={`submission-${key}-title`} aria-describedby={`submission-${key}-description`}
          className="group block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <Card className="relative h-full shadow-xs transition-shadow group-hover:shadow-md group-hover:ring-primary/40 group-focus-visible:ring-primary/40 motion-reduce:transition-none">
            <div aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", tone)} />
            <CardHeader className="gap-x-3 gap-y-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", tone)}>
                  <Icon aria-hidden="true" />
                </div>
                <CardTitle className="min-w-0"><h3 className="font-semibold" id={`submission-${key}-title`}>{t(`newSubmission.methods.${key}.title`)}</h3></CardTitle>
              </div>
              <CardAction className="row-span-1 self-center">
                <span className="flex size-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary group-focus-visible:bg-primary/10 group-focus-visible:text-primary motion-reduce:transition-none">
                  <IconArrowRight className="size-4" aria-hidden="true" />
                </span>
              </CardAction>
              <CardDescription className="col-span-full" id={`submission-${key}-description`}>{t(`newSubmission.methods.${key}.description`)}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </motion.li>)}
    </ul>
  </nav>;
}

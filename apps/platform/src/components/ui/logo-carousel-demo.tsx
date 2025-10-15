"use client";

import { LogoCarousel } from "@/components/ui/logo-carousel";
import { Card, CardContent } from "@/components/ui/card";

const demoLogos = [
  {
    id: 1,
    name: "Forbes",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Forbes_logo.svg/320px-Forbes_logo.svg.png",
  },
  {
    id: 2,
    name: "TechCrunch",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TechCrunch_logo.svg/320px-TechCrunch_logo.svg.png",
  },
  {
    id: 3,
    name: "Wired",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Wired_logo.svg/320px-Wired_logo.svg.png",
  },
  {
    id: 4,
    name: "Fast Company",
    src: "https://logos-world.net/wp-content/uploads/2020/11/Fast-Company-Logo.png",
  },
  {
    id: 5,
    name: "Harvard Business Review",
    src: "https://logos-world.net/wp-content/uploads/2021/02/Harvard-Business-Review-Logo.png",
  },
  {
    id: 6,
    name: "MIT Technology Review",
    src: "https://www.technologyreview.com/wp-content/uploads/2019/08/mit_technology_review_logo.png",
  },
];

function LogoCarouselBasic() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4 mb-12">
          <p className="text-sm font-medium tracking-widest text-muted-foreground">
            TRUSTED BY TEAMS FROM AROUND THE WORLD
          </p>
          <h2 className="text-[3.5rem] font-bold tracking-tight leading-none">
            The best are already here
          </h2>
        </div>
        <LogoCarousel logos={demoLogos} columns={3} />
      </CardContent>
    </Card>
  );
}

export { LogoCarouselBasic };

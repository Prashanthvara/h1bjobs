export interface Company {
    id: string;
    name: string;
    location: string;
    h1b_approvals: number;
    approvals_year: string;
    website: string;
    careers_url: string;
    linkedin_url: string;
    x_url: string;
    instagram_url: string;
    logo_url: string;
    exemptiondetails: string;
    tags: string;
    jobtitles: string;
    department: string;
    source: string;
}

export const companies: Company[] = [
    {
        "id": "1",
        "name": "University of Michigan",
        "location": "Ann Arbor, MI",
        "h1b_approvals": 470,
        "approvals_year": "FY2024",
        "website": "https://umich.edu",
        "careers_url": "https://careers.umich.edu/",
        "linkedin_url": "https://www.linkedin.com/school/university-of-michigan/",
        "x_url": "https://x.com/umich",
        "instagram_url": "https://instagram.com/uofmichigan",
        "logo_url": "/logos/university-of-michigan.png",
        "exemptiondetails": "The University of Michigan is cap-exempt due to its status as a public nonprofit educational and research institution, allowing unlimited H-1B petitions without entering the annual lottery.",
        "tags": "Education, Research, Non Profit",
        "jobtitles": "Postdoctoral Research Fellow, Assistant Professor, Research Investigator, Assistant Research Scientist, Research Lab Specialist Intermediate",
        "department": "Engineering, Medicine, Science",
        "source": "https://www.myvisajobs.com/employer/university-michigan"
    },
    {
        "id": "2",
        "name": "Mayo Clinic",
        "location": "Rochester, MN",
        "h1b_approvals": 470,
        "approvals_year": "FY2024",
        "website": "https://mayoclinic.org",
        "careers_url": "https://jobs.mayoclinic.org/",
        "linkedin_url": "https://www.linkedin.com/company/mayo-clinic",
        "x_url": "https://x.com/MayoClinic",
        "instagram_url": "https://www.instagram.com/mayoclinic/",
        "logo_url": "/logos/mayo-clinic.png",
        "exemptiondetails": "Mayo Clinic is cap-exempt due to its status as a nonprofit medical practice and research institution, allowing unlimited H-1B petitions without entering the annual lottery.",
        "tags": "Healthcare, Research, Non Profit",
        "jobtitles": "Clinical Resident, Research Fellow, Research Associate, Research Technologist, Physician, Hospitalist, Senior Research Fellow, Informatics Specialist, Medical Technologist, Data Science Analyst",
        "department": "Research, Business, Medicine",
        "source": "https://www.myvisajobs.com/employer/mayo-clinic-rochester/"
    },
    {
        "id": "3",
        "name": "Stanford University",
        "location": "Stanford, CA",
        "h1b_approvals": 676,
        "approvals_year": "FY2024",
        "website": "https://stanford.edu",
        "careers_url": "https://careersearch.stanford.edu/",
        "linkedin_url": "https://www.linkedin.com/school/stanford-university/",
        "x_url": "https://x.com/stanford",
        "instagram_url": "https://www.instagram.com/stanford/",
        "logo_url": "/logos/stanford-university.png",
        "exemptiondetails": "Stanford University is cap-exempt due to its status as a private nonprofit educational and research institution, allowing unlimited H-1B petitions without entering the annual lottery.",
        "tags": "Education, Research, Non Profit",
        "jobtitles": "Postdoctoral Research Affiliate, Basic Life Research Scientist, Instructor, Physical Science Research Scientist, Research Engineer, Life Science Research Professional 2, Assistant Professor, Life Science Research Professional 1, Postdoc Res Affiliate, Basic Life Res Scientist",
        "department": "Medicine, Science, Engineering",
        "source": "https://www.myvisajobs.com/employer/leland-stanford-jr-university/"
    },
    {
        "id": "4",
        "name": "Johns Hopkins University",
        "location": "Baltimore, MD",
        "h1b_approvals": 293,
        "approvals_year": "FY2024",
        "website": "https://jhu.edu",
        "careers_url": "https://hiring.jhu.edu/careers",
        "linkedin_url": "https://www.linkedin.com/school/johns-hopkins-university/",
        "x_url": "https://x.com/JohnsHopkins",
        "instagram_url": "https://instagram.com/johnshopkinsu",
        "logo_url": "/logos/johns-hopkins-university.png",
        "exemptiondetails": "Johns Hopkins University is cap-exempt due to its status as a private nonprofit educational and research institution, allowing unlimited H-1B petitions without entering the annual lottery.",
        "tags": "Education, Research, Non Profit",
        "jobtitles": "Postdoctoral Research Fellow, Research Associate, Assistant Professor, Postdoctoral Fellow, Assistant Research Scientist, Resident, Assistant Scientist, Instructor, Sr. Research Data Analyst, Research Data Analyst",
        "department": "Medicine, Science, Engineering",
        "source": "https://www.myvisajobs.com/employer/johns-hopkins-university/"
    },
    {
        "id": "5",
        "name": "University of Chicago",
        "location": "Chicago, IL",
        "h1b_approvals": 270,
        "approvals_year": "FY2024",
        "website": "https://uchicago.edu",
        "careers_url": "https://uchicago.wd5.myworkdayjobs.com/External",
        "linkedin_url": "https://www.linkedin.com/school/uchicago/",
        "x_url": "https://x.com/UChicago",
        "instagram_url": "https://instagram.com/uchicago",
        "logo_url": "/logos/university-of-chicago.png",
        "exemptiondetails": "The University of Chicago is cap-exempt due to its status as a private nonprofit educational and research institution, allowing unlimited H-1B petitions without entering the annual lottery.",
        "tags": "Education, Research, Non Profit",
        "jobtitles": "Postdoctoral Scholar, Assistant Professor, Research Professional, Staff Scientist, L.e. Dickson Instructor, Assistant Instructional Professor, Research Professional 1, Research Specialist 2, Bioinformatician, Research Analyst",
        "department": "Science, Medicine, Engineering",
        "source": "https://www.myvisajobs.com/employer/university-chicago/"
    },
    {
        "id": "6",
        "name": "Emory University",
        "location": "Atlanta, GA",
        "h1b_approvals": 289,
        "approvals_year": "FY2024",
        "website": "https://emory.edu",
        "careers_url": "https://staff-emory.icims.com/jobs/search",
        "linkedin_url": "https://www.linkedin.com/school/emory-university/",
        "x_url": "https://x.com/EmoryUniversity",
        "instagram_url": "https://www.instagram.com/emoryuniversity/",
        "logo_url": "/logos/emory-university.png",
        "exemptiondetails": "Emory University is cap-exempt due to its status as a private nonprofit educational and research institution, allowing unlimited H-1B petitions without entering the annual lottery.",
        "tags": "Education, Research, Non Profit",
        "jobtitles": "Assistant Professor, Postdoctoral Fellow, Assistant Academic Research Scientist, Associate Academic Research Scientist, Medical House Staff - Resident, Medical House Staff - Fellow, Post-doctoral Fellow, Post Doctoral Fellow, Instructor, Assistant Professor Of Medicine",
        "department": "Medicine, Science, Engineering",
        "source": "https://www.myvisajobs.com/employer/emory-university/"
    },
    {
        "id": "7",
        "name": "University of Pennsylvania",
        "location": "Philadelphia, PA",
        "h1b_approvals": 308,
        "approvals_year": "FY2024",
        "website": "https://www.upenn.edu/",
        "careers_url": "https://wd1.myworkdaysite.com/recruiting/upenn/careers-at-penn",
        "linkedin_url": "https://www.linkedin.com/school/university-of-pennsylvania",
        "x_url": "https://x.com/Penn",
        "instagram_url": "https://instagram.com/uofpenn",
        "logo_url": "/logos/university-of-pennsylvania.png",
        "exemptiondetails": "The University of Pennsylvania is cap-exempt due to its status as a private nonprofit educational and research institution, allowing unlimited H-1B petitions without entering the annual lottery.",
        "tags": "Education, Research, Non Profit",
        "jobtitles": "Postdoctoral Researcher, Research Associate, Assistant Professor, Senior Research Investigator, Research Specialist D, Research Specialist B, Research Specialist C, Lecturer A, Research Specialist A, Postdoctoral Fellow",
        "department": "Medicine, Science, Engineering",
        "source": "https://www.myvisajobs.com/employer/university-pennsylvania/"
    },
    {
        "id": "8",
        "name": "Yale University",
        "location": "New Haven, CT",
        "h1b_approvals": 207,
        "approvals_year": "FY2024",
        "website": "https://yale.edu",
        "careers_url": "https://careers.yale.edu/us/en/search-results",
        "linkedin_url": "https://www.linkedin.com/school/yale-university/",
        "x_url": "https://x.com/yale",
        "instagram_url": "https://instagram.com/yale/",
        "logo_url": "/logos/yale-university.png",
        "exemptiondetails": "Yale University is cap-exempt due to its status as a private nonprofit educational and research institution, allowing unlimited H-1B petitions without entering the annual lottery.",
        "tags": "Education, Research, Non Profit",
        "jobtitles": "Associate Research Scientist, Postdoctoral Associate, Assistant Professor, Instructor, Associate Professor, Research Scientist, Biostatistician, Lecturer, Professor, Clinical Fellow",
        "department": "Medicine, Science, Engineering",
        "source": "https://www.myvisajobs.com/employer/yale-university/"
    },
    {
        "id": "9",
        "name": "University of Florida",
        "location": "Gainesville, FL",
        "h1b_approvals": 253,
        "approvals_year": "FY2024",
        "website": "https://ufl.edu",
        "careers_url": "https://explore.jobs.ufl.edu/en-us/listing/",
        "linkedin_url": "https://www.linkedin.com/school/uflorida/",
        "x_url": "https://x.com/UF/",
        "instagram_url": "https://instagram.com/uflorida/",
        "logo_url": "/logos/university-of-florida.png",
        "exemptiondetails": "The University of Florida is cap-exempt due to its status as a public nonprofit educational and research institution, allowing unlimited H-1B petitions without entering the annual lottery.",
        "tags": "Education, Research, Non Profit",
        "jobtitles": "Assistant Professor, Clinical Assistant Professor, Assistant Scientist, Postdoctoral Associate, Research Assistant Professor, Post Doctoral Associate, Lecturer, Resident, Research Assistant Scientist, Biological Scientist II",
        "department": "Medicine, Science, Engineering",
        "source": "https://www.myvisajobs.com/employer/university-florida/"
    },
    {
        "id": "10",
        "name": "University of Pittsburgh",
        "location": "Pittsburgh, PA",
        "h1b_approvals": 272,
        "approvals_year": "FY2024",
        "website": "https://pitt.edu",
        "careers_url": "https://cfopitt.taleo.net/careersection/pitt_staff_external/jobsearch.ftl",
        "linkedin_url": "https://www.linkedin.com/school/university-of-pittsburgh",
        "x_url": "https://x.com/PittTweet",
        "instagram_url": "https://www.instagram.com/pittofficial/",
        "logo_url": "/logos/university-of-pittsburgh.png",
        "exemptiondetails": "The University of Pittsburgh is cap-exempt due to its status as a public nonprofit educational and research institution, allowing unlimited H-1B petitions without entering the annual lottery.",
        "tags": "Education, Research, Non Profit",
        "jobtitles": "Postdoctoral Associate, Assistant Professor, Hospitalist, Research Scientist, Research Assistant Professor, Research Instructor, Clinical Instructor, Post Doctoral Associate, Research Associate, Senior Research Specialist",
        "department": "Medicine, Science, Engineering",
        "source": "https://www.myvisajobs.com/employer/university-pittsburgh-physicians/"
    }
];

# Enterprise Real Estate Web App Nextjs
Following a 12hour tutorial by EdRoh

# Personal Notes

shadcn is a component library write what you need in the terminal and a component will show up in the component folder and can jump into implementation right away


scroll={false} to fix the page position when navigating to the new page normally with Link component

aria-label element for icons to enable screen readers like the blind to know its a facebook icon

used postgreSQL Geospatial (GIS): Through PostGIS, Postgres is the gold standard for mapping, location tracking, and distance calculations.

we use <main> firstly its for the blind screen readers, they have shortcut to jump to the main content. SEO will give more weight to the keywords found inside main . One page can only consist one main tag

used redux tool kit (rival for tanstackquery) in the api.ts file to handle http request like get / put.It has 2 types build.query for fetching data and build.mutation for editing any data to the database 
-- Seed initial data

-- Insert default site settings
INSERT INTO public.site_settings (company_name, tagline, description, contact_email, contact_phone, payment_instructions)
VALUES (
  'CreativeHub',
  'Transforming Ideas Into Digital Reality',
  'We are a full-service digital agency specializing in web development, design, marketing, and professional training. Our team delivers exceptional results that drive growth and innovation.',
  'hello@creativehub.com',
  '+1 (555) 000-0000',
  'Please transfer the course fee to our bank account and upload a screenshot of your payment receipt. Your registration will be approved within 24 hours of verification.'
)
ON CONFLICT DO NOTHING;

-- Seed services
INSERT INTO public.services (title, description, short_description, icon_name, category, features, sort_order) VALUES
('Web Development', 'We build modern, responsive, and high-performance websites and web applications tailored to your business needs. From simple landing pages to complex web platforms, we deliver solutions that work.', 'Custom websites and web applications built with cutting-edge technology.', 'Globe', 'development', '["Responsive Design", "E-commerce Solutions", "Custom Web Apps", "CMS Integration", "API Development"]', 1),
('UI/UX Design', 'Our design team creates stunning, user-friendly interfaces that captivate your audience and drive engagement. We focus on user experience to ensure your digital products are intuitive and beautiful.', 'Beautiful, intuitive interfaces that users love.', 'Palette', 'design', '["User Research", "Wireframing", "Prototyping", "Visual Design", "Design Systems"]', 2),
('Logo Design', 'Your logo is the face of your brand. We create memorable, versatile logos that communicate your brand identity and leave a lasting impression on your audience.', 'Memorable brand identities that stand out.', 'PenTool', 'design', '["Brand Identity", "Logo Concepts", "Brand Guidelines", "Icon Design", "Typography"]', 3),
('Flyer Design', 'Eye-catching flyer designs that communicate your message effectively. Perfect for events, promotions, and marketing campaigns that demand attention.', 'Professional print and digital marketing materials.', 'FileImage', 'design', '["Event Flyers", "Brochures", "Posters", "Business Cards", "Social Media Graphics"]', 4),
('Video Production', 'Professional video content that tells your story. From promotional videos to educational content, we produce high-quality videos that engage and inspire your audience.', 'Engaging video content that tells your story.', 'Video', 'media', '["Promotional Videos", "Motion Graphics", "Video Editing", "Animation", "Social Media Content"]', 5),
('Digital Marketing', 'Strategic digital marketing solutions to grow your online presence. We help you reach the right audience through data-driven campaigns across multiple channels.', 'Data-driven strategies to grow your business online.', 'TrendingUp', 'marketing', '["SEO Optimization", "Social Media Marketing", "Content Strategy", "PPC Campaigns", "Email Marketing"]', 6)
ON CONFLICT DO NOTHING;

-- Seed courses
INSERT INTO public.courses (title, description, short_description, category, price, currency, duration, level, curriculum, sort_order) VALUES
('Web Development Bootcamp', 'A comprehensive course covering HTML, CSS, JavaScript, React, and Next.js. Build real-world projects and launch your career in web development.', 'Learn to build modern web applications from scratch.', 'development', 299.99, 'USD', '12 weeks', 'beginner', '[{"module":"HTML & CSS Fundamentals","lessons":["Introduction to HTML","HTML Elements & Attributes","CSS Basics","Flexbox & Grid","Responsive Design"]},{"module":"JavaScript Essentials","lessons":["Variables & Data Types","Functions & Scope","DOM Manipulation","Async JavaScript","ES6+ Features"]},{"module":"React & Next.js","lessons":["React Components","State & Props","Hooks","Next.js Routing","API Integration","Deployment"]}]', 1),
('Graphic Design Masterclass', 'Master the art of visual design. Learn design principles, color theory, typography, and industry-standard tools to create stunning visual content.', 'Master design principles and create stunning visuals.', 'design', 199.99, 'USD', '8 weeks', 'beginner', '[{"module":"Design Fundamentals","lessons":["Design Principles","Color Theory","Typography Basics","Composition & Layout"]},{"module":"Digital Design Tools","lessons":["Introduction to Design Software","Vector Graphics","Photo Editing","Digital Illustration"]},{"module":"Applied Design","lessons":["Logo Design Project","Flyer Design Project","Social Media Design","Portfolio Building"]}]', 2),
('Digital Marketing Strategy', 'Learn how to create and execute effective digital marketing campaigns. From SEO to social media, master the skills that drive business growth online.', 'Master the strategies that drive online business growth.', 'marketing', 249.99, 'USD', '10 weeks', 'intermediate', '[{"module":"Marketing Foundations","lessons":["Digital Marketing Overview","Market Research","Target Audience Analysis","Marketing Funnel"]},{"module":"Content & SEO","lessons":["Content Strategy","SEO Fundamentals","Keyword Research","On-Page & Off-Page SEO"]},{"module":"Paid & Social","lessons":["Social Media Marketing","PPC Advertising","Email Marketing","Analytics & Reporting"]}]', 3)
ON CONFLICT DO NOTHING;

-- Seed testimonials
INSERT INTO public.testimonials (client_name, client_title, content, rating, sort_order) VALUES
('Sarah Johnson', 'CEO, TechStart', 'Working with this team was an incredible experience. They delivered a website that exceeded our expectations and helped us grow our online presence significantly.', 5, 1),
('Michael Chen', 'Founder, DesignCo', 'The design work was outstanding. They understood our vision perfectly and created a brand identity that truly represents who we are.', 5, 2),
('Emily Rodriguez', 'Marketing Director, GrowthLab', 'Their digital marketing expertise helped us double our online leads within three months. Highly recommended for any business looking to grow.', 5, 3)
ON CONFLICT DO NOTHING;

-- Create storage buckets (this will be done via Supabase dashboard or API)
-- Buckets needed: uploads (for payment screenshots, materials, certificates, portfolio images, logos)

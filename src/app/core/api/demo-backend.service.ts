export interface DemoMentor {
  id: number;
  name: string;
  field: string;
  description: string;
  research_area?: string;
  photo?: string;
  workshop_title?: string;
  pending_requests?: number;
  total_requests?: number;
}

export interface DemoProject {
  id: number;
  title: string;
  category: string;
  description: string;
  team_size?: number;
  mentor_id?: number;
  mentor_name?: string;
  accepted?: number;
  capacity?: number;
  available?: number;
  is_full?: boolean;
  members?: DemoRequestItem[];
}

export interface DemoRequestItem {
  id: number;
  request_type: 'mentor' | 'project';
  status: string;
  mentor_id?: number;
  mentor_name?: string;
  project_id?: number;
  project_title?: string;
  student_name: string;
  email: string;
  role?: string;
  faculty?: string;
  skills?: string;
  availability?: string;
  interest?: string;
  intro?: string;
  message?: string;
}

export interface DemoStudentSession {
  email: string;
  student_name: string;
  pending: number;
  accepted: number;
  requests: DemoRequestItem[];
}

export interface DemoMentorSession {
  mentor: DemoMentor;
  requests: DemoRequestItem[];
  projects: DemoProject[];
}

export interface DemoAdminStudent {
  id: number;
  name: string;
  email: string;
  photo_url?: string;
  created_at: string;
}

export interface DemoAdminData {
  students: DemoAdminStudent[];
  pending: DemoMentor[];
  approved: DemoMentor[];
  rejected: DemoMentor[];
}

interface DemoStudentAuthForm {
  student_name: string;
  email: string;
  password: string;
}

interface DemoMentorRequestForm {
  mentor_id: string;
  interest: string;
  message: string;
}

interface DemoProjectRequestForm {
  project_id: string;
  mentor_id: string;
  project_title: string;
  role: string;
  faculty: string;
  skills: string;
  availability: string;
  intro: string;
  message: string;
}

interface DemoMentorRegistrationForm {
  name: string;
  field: string;
  description: string;
  research_area: string;
  email: string;
  access_code: string;
  workshop_title: string;
  workshop_description: string;
}

interface DemoProjectForm {
  title: string;
  category: string;
  description: string;
  team_size: number;
}

@Injectable({ providedIn: 'root' })
export class DemoBackend {
  private studentName = 'Rafi Demo Student';
  private studentEmail = 'demo.student@mmu.edu.my';
  private nextRequestId = 40;
  private nextProjectId = 20;
  private nextMentorId = 12;
  private nextStudentId = 4;

  private mentors: DemoMentor[] = [
    {
      id: 1,
      name: 'Dr. Aisha Rahman',
      field: 'Artificial Intelligence',
      research_area: 'Ethical AI, machine learning, and student support tools',
      description: 'Guides students building practical AI products, recommendation systems, and responsible ML prototypes.',
      workshop_title: 'Build an AI Study Assistant'
    },
    {
      id: 2,
      name: 'Engr. Kelvin Lim',
      field: 'Robotics',
      research_area: 'Autonomous systems, ROS, and lab automation',
      description: 'Supports robotics teams with prototyping, sensors, control systems, and presentation-ready demos.',
      workshop_title: 'Robotics Lab Sprint'
    },
    {
      id: 3,
      name: 'Dr. Mei Tan',
      field: 'IoT Engineering',
      research_area: 'Smart campus sensors, embedded systems, and dashboards',
      description: 'Mentors teams creating IoT devices, data pipelines, and real-time monitoring dashboards.',
      workshop_title: 'Smart Campus IoT'
    }
  ];

  private projects: DemoProject[] = [
    {
      id: 10,
      title: 'Smart Campus Energy Dashboard',
      category: 'IoT',
      description: 'Track room-level energy usage with low-cost sensors and a live analytics dashboard.',
      team_size: 5,
      capacity: 5,
      mentor_id: 3,
      mentor_name: 'Dr. Mei Tan'
    },
    {
      id: 11,
      title: 'AI Study Buddy',
      category: 'Artificial Intelligence',
      description: 'Prototype a student assistant that turns lecture notes into quizzes, summaries, and study plans.',
      team_size: 4,
      capacity: 4,
      mentor_id: 1,
      mentor_name: 'Dr. Aisha Rahman'
    },
    {
      id: 12,
      title: 'Robotics Lab Assistant',
      category: 'Robotics',
      description: 'Build a small mobile robot that can move lab equipment and report task progress.',
      team_size: 3,
      capacity: 3,
      mentor_id: 2,
      mentor_name: 'Engr. Kelvin Lim'
    }
  ];

  private requests: DemoRequestItem[] = [
    {
      id: 31,
      request_type: 'mentor',
      status: 'accepted',
      mentor_id: 1,
      mentor_name: 'Dr. Aisha Rahman',
      student_name: 'Rafi Demo Student',
      email: 'demo.student@mmu.edu.my',
      interest: 'Artificial Intelligence',
      message: 'I want guidance turning a learning assistant idea into a working AI prototype.'
    },
    {
      id: 32,
      request_type: 'project',
      status: 'accepted',
      mentor_id: 3,
      mentor_name: 'Dr. Mei Tan',
      project_id: 10,
      project_title: 'Smart Campus Energy Dashboard',
      student_name: 'Rafi Demo Student',
      email: 'demo.student@mmu.edu.my',
      role: 'Frontend dashboard',
      faculty: 'Faculty of Computing and Informatics',
      skills: 'Angular, charts, API design',
      availability: 'Weekends and weekday evenings',
      intro: 'I can build the live dashboard and explain the prototype for portfolio demos.',
      message: 'Accepted demo project membership.'
    },
    {
      id: 33,
      request_type: 'project',
      status: 'pending',
      mentor_id: 1,
      mentor_name: 'Dr. Aisha Rahman',
      project_id: 11,
      project_title: 'AI Study Buddy',
      student_name: 'Rafi Demo Student',
      email: 'demo.student@mmu.edu.my',
      role: 'AI workflow designer',
      faculty: 'Faculty of Computing and Informatics',
      skills: 'Python, prompt design, UX writing',
      availability: 'Three sessions per week',
      intro: 'I want to design the study workflow and build a clickable AI demo.',
      message: 'Waiting for mentor approval.'
    }
  ];

  private students: DemoAdminStudent[] = [
    {
      id: 1,
      name: 'Rafi Demo Student',
      email: 'demo.student@mmu.edu.my',
      created_at: '2026-05-01T10:15:00.000Z'
    },
    {
      id: 2,
      name: 'Nur Iman Wong',
      email: 'nur.iman@mmu.edu.my',
      created_at: '2026-05-05T08:45:00.000Z'
    },
    {
      id: 3,
      name: 'Daniel Lee',
      email: 'daniel.lee@mmu.edu.my',
      created_at: '2026-05-07T13:30:00.000Z'
    }
  ];

  private pendingMentors: DemoMentor[] = [
    {
      id: 8,
      name: 'Prof. Sara Nordin',
      field: 'Cybersecurity',
      research_area: 'Threat modeling and secure campus applications',
      description: 'Wants to mentor students building security awareness tools and safer web systems.'
    }
  ];

  private rejectedMentors: DemoMentor[] = [
    {
      id: 9,
      name: 'Demo Pending Archive',
      field: 'General STEM',
      research_area: 'Incomplete profile',
      description: 'Rejected sample record so the admin tab has realistic history.'
    }
  ];

  catalog(): { mentors: DemoMentor[]; projects: DemoProject[] } {
    return {
      mentors: this.mentors.map((mentor) => this.withMentorStats(mentor)),
      projects: this.projects.map((project) => this.withProjectSeats(project))
    };
  }

  loginStudent(form: DemoStudentAuthForm): DemoStudentSession {
    this.applyStudentIdentity(form);
    return this.studentSession();
  }

  registerStudent(form: DemoStudentAuthForm): DemoStudentSession {
    this.applyStudentIdentity(form);
    return this.studentSession();
  }

  studentSession(): DemoStudentSession {
    const requests = this.requests
      .filter((request) => request.email === this.studentEmail)
      .map((request) => ({ ...request }));

    return {
      email: this.studentEmail,
      student_name: this.studentName,
      pending: requests.filter((request) => request.status === 'pending').length,
      accepted: requests.filter((request) => request.status === 'accepted').length,
      requests
    };
  }

  sendMentorRequest(form: DemoMentorRequestForm): string {
    const mentor = this.mentors.find((item) => String(item.id) === String(form.mentor_id));
    if (!mentor) {
      return 'Choose a mentor first, then send the request.';
    }

    const existing = this.requests.find(
      (request) =>
        request.email === this.studentEmail &&
        request.request_type === 'mentor' &&
        request.mentor_id === mentor.id &&
        ['pending', 'accepted'].includes(request.status)
    );

    if (existing) {
      return `${mentor.name} is already connected or reviewing your request in this demo.`;
    }

    this.requests.unshift({
      id: this.nextRequestId++,
      request_type: 'mentor',
      status: 'pending',
      mentor_id: mentor.id,
      mentor_name: mentor.name,
      student_name: this.studentName,
      email: this.studentEmail,
      interest: form.interest || mentor.field,
      message: form.message || `I would like mentorship in ${mentor.field}.`
    });

    return `Mentor request sent to ${mentor.name}.`;
  }

  sendProjectRequest(form: DemoProjectRequestForm): string {
    if (this.studentSession().accepted === 0) {
      return 'Connect with a mentor first before requesting a project seat.';
    }

    const selectedProject = this.projects.find((project) => String(project.id) === String(form.project_id));
    const mentorId = Number(form.mentor_id || selectedProject?.mentor_id || this.mentors[0].id);
    const mentor = this.mentors.find((item) => item.id === mentorId) ?? this.mentors[0];
    const title = selectedProject?.title || form.project_title.trim() || 'New STEM Demo Project';
    const projectSnapshot = selectedProject ? this.withProjectSeats(selectedProject) : null;

    if (projectSnapshot?.is_full) {
      return `${projectSnapshot.title} is full in the demo data.`;
    }

    this.requests.unshift({
      id: this.nextRequestId++,
      request_type: 'project',
      status: 'pending',
      mentor_id: mentor.id,
      mentor_name: mentor.name,
      project_id: selectedProject?.id,
      project_title: title,
      student_name: this.studentName,
      email: this.studentEmail,
      role: form.role || 'Demo team member',
      faculty: form.faculty || 'Faculty of Computing and Informatics',
      skills: form.skills || 'Research, prototyping, presentation',
      availability: form.availability || 'Flexible demo availability',
      intro: form.intro || `I want to contribute to ${title}.`,
      message: form.message || 'Demo project request submitted.'
    });

    return `Project request sent to ${mentor.name}.`;
  }

  withdrawRequest(requestId: number): string {
    const request = this.requests.find((item) => item.id === requestId);
    if (!request) {
      return 'That request is no longer available in the demo.';
    }

    request.status = 'withdrawn';
    return 'Request withdrawn in demo mode.';
  }

  registerMentor(form: DemoMentorRegistrationForm): string {
    const mentor: DemoMentor = {
      id: this.nextMentorId++,
      name: form.name.trim() || 'Demo Mentor Applicant',
      field: form.field.trim() || 'STEM Innovation',
      research_area: form.research_area.trim() || 'Project-based learning',
      description: form.description.trim() || 'Demo mentor profile submitted for admin approval.',
      workshop_title: form.workshop_title.trim() || undefined
    };

    this.pendingMentors.unshift(mentor);
    return `${mentor.name} was submitted for admin approval.`;
  }

  loginMentor(): DemoMentorSession {
    return this.mentorSession();
  }

  mentorSession(): DemoMentorSession {
    const mentor = this.withMentorStats(this.mentors[0]);
    const requests = this.requests
      .filter((request) => request.mentor_id === mentor.id)
      .map((request) => ({ ...request }));
    const projects = this.catalog().projects.filter((project) => project.mentor_id === mentor.id);

    return { mentor, requests, projects };
  }

  decideRequest(requestId: number, action: 'accepted' | 'rejected'): string {
    const request = this.requests.find((item) => item.id === requestId);
    if (!request) {
      return 'That request is no longer available in the demo.';
    }

    request.status = action;

    if (action === 'accepted' && request.request_type === 'project' && !request.project_id) {
      const mentor = this.mentors.find((item) => item.id === request.mentor_id) ?? this.mentors[0];
      const project: DemoProject = {
        id: this.nextProjectId++,
        title: request.project_title || 'New STEM Demo Project',
        category: mentor.field,
        description: request.intro || request.message || 'Student-proposed demo project.',
        team_size: 4,
        capacity: 4,
        mentor_id: mentor.id,
        mentor_name: mentor.name
      };
      this.projects.unshift(project);
      request.project_id = project.id;
      request.project_title = project.title;
    }

    return `Request ${action}.`;
  }

  createMentorProject(form: DemoProjectForm): string {
    const mentor = this.mentors[0];
    const project: DemoProject = {
      id: this.nextProjectId++,
      title: form.title.trim() || 'New Mentor Demo Project',
      category: form.category.trim() || mentor.field,
      description: form.description.trim() || 'A mentor-created project available in the Vercel demo.',
      team_size: Number(form.team_size) || 4,
      capacity: Number(form.team_size) || 4,
      mentor_id: mentor.id,
      mentor_name: mentor.name
    };

    this.projects.unshift(project);
    return `${project.title} is now listed in the demo catalog.`;
  }

  adminData(): DemoAdminData {
    return {
      students: this.students.map((student) => ({ ...student })),
      pending: this.pendingMentors.map((mentor) => this.withMentorStats(mentor)),
      approved: this.catalog().mentors,
      rejected: this.rejectedMentors.map((mentor) => this.withMentorStats(mentor))
    };
  }

  approveMentor(mentorId: number): string {
    const mentor = this.moveMentor(this.pendingMentors, mentorId);
    if (!mentor) {
      return 'That mentor has already been handled.';
    }

    this.mentors.unshift(mentor);
    return `${mentor.name} approved.`;
  }

  rejectMentor(mentorId: number): string {
    const mentor = this.moveMentor(this.pendingMentors, mentorId);
    if (!mentor) {
      return 'That mentor has already been handled.';
    }

    this.rejectedMentors.unshift(mentor);
    return `${mentor.name} rejected.`;
  }

  deleteMentor(mentorId: number): string {
    const removed =
      this.moveMentor(this.mentors, mentorId) ||
      this.moveMentor(this.pendingMentors, mentorId) ||
      this.moveMentor(this.rejectedMentors, mentorId);

    return removed ? `${removed.name} removed from demo data.` : 'That mentor is already removed.';
  }

  deleteStudent(studentId: number): string {
    const before = this.students.length;
    this.students = this.students.filter((student) => student.id !== studentId);
    return before === this.students.length ? 'That student is already removed.' : 'Student removed from the admin list.';
  }

  chatReply(question: string): string {
    const text = question.toLowerCase();

    if (text.includes('mentor')) {
      return 'You are already signed in as a demo student. Open STEM Portal, choose Mentors, and click Connect to create a live pending request.';
    }

    if (text.includes('project') || text.includes('join')) {
      return 'The demo student already has one accepted mentor, so project requests are enabled. Pick a project or propose a new idea from My Workspace.';
    }

    if (text.includes('admin')) {
      return 'Admin access is open by default in this Vercel demo. You can approve mentors, reject registrations, and remove sample records without a password.';
    }

    if (text.includes('login') || text.includes('password')) {
      return 'Login is disabled for portfolio viewing. Student, mentor, and admin sessions are preloaded so visitors can interact immediately.';
    }

    if (text.includes('ai') || text.includes('robot') || text.includes('iot')) {
      return 'Good STEM demo areas here are AI Study Buddy, Robotics Lab Assistant, and Smart Campus Energy Dashboard. Each one shows mentor and team workflows.';
    }

    return 'Try the STEM Portal tabs, create a request, open the mentor workspace to accept it, or use the admin page to approve a sample mentor.';
  }

  private applyStudentIdentity(form: DemoStudentAuthForm): void {
    const previousEmail = this.studentEmail;
    this.studentName = form.student_name.trim() || this.studentName;
    this.studentEmail = form.email.trim() || this.studentEmail;

    this.requests = this.requests.map((request) =>
      request.email === previousEmail
        ? { ...request, email: this.studentEmail, student_name: this.studentName }
        : request
    );

    if (!this.students.some((student) => student.email === this.studentEmail)) {
      this.students.unshift({
        id: this.nextStudentId++,
        name: this.studentName,
        email: this.studentEmail,
        created_at: new Date().toISOString()
      });
    }
  }

  private withMentorStats(mentor: DemoMentor): DemoMentor {
    const mentorRequests = this.requests.filter((request) => request.mentor_id === mentor.id);

    return {
      ...mentor,
      pending_requests: mentorRequests.filter((request) => request.status === 'pending').length,
      total_requests: mentorRequests.length
    };
  }

  private withProjectSeats(project: DemoProject): DemoProject {
    const capacity = project.capacity ?? project.team_size ?? 4;
    const members = this.requests.filter(
      (request) =>
        request.request_type === 'project' &&
        request.project_id === project.id &&
        request.status === 'accepted'
    );

    return {
      ...project,
      capacity,
      team_size: project.team_size ?? capacity,
      accepted: members.length,
      available: Math.max(0, capacity - members.length),
      is_full: members.length >= capacity,
      members: members.map((member) => ({ ...member }))
    };
  }

  private moveMentor(source: DemoMentor[], mentorId: number): DemoMentor | null {
    const index = source.findIndex((mentor) => mentor.id === mentorId);
    if (index === -1) {
      return null;
    }

    const [mentor] = source.splice(index, 1);
    return mentor;
  }
}
import { Injectable } from '@angular/core';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  ClipboardList,
  UserCheck,
  TrendingUp,
  Percent,
  Calculator,
  Bookmark,
  Sparkles,
  Info
} from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [courseSummaries, setCourseSummaries] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Faculty states
  const [selectedCourse, setSelectedCourse] = useState('course_01');
  const [students, setStudents] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState({}); // { studentId: 'Present'/'Absent'/'Late' }
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Student Calculator states
  const [calcCourse, setCalcCourse] = useState('');
  const [extraAbsences, setExtraAbsences] = useState(0);

  // Filter state for records
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    fetchAttendanceData();
  }, [user]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await attendanceAPI.get();
      
      let fetchedRecords = response.data.records || [];
      let fetchedSummaries = response.data.courseSummaries || [];

      // Check if we need to load rich demo details
      if (fetchedRecords.length === 0 && user.role === 'student') {
        setIsDemoMode(true);
        // Rich, realistic demo records
        fetchedRecords = [
          {
            _id: 'rec_1',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
            courseCode: 'CS-301',
            courseName: 'Advanced Web Engineering',
            status: 'Present',
            notes: 'Active participation in React optimization lab'
          },
          {
            _id: 'rec_2',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
            courseCode: 'CS-302',
            courseName: 'Database Architecture',
            status: 'Present',
            notes: 'Indexed tuning session'
          },
          {
            _id: 'rec_3',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            courseCode: 'CS-303',
            courseName: 'Artificial Intelligence',
            status: 'Present',
            notes: 'Gemma model context sizes walkthrough'
          },
          {
            _id: 'rec_4',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            courseCode: 'CS-301',
            courseName: 'Advanced Web Engineering',
            status: 'Present',
            notes: 'REST vs GraphQL debate'
          },
          {
            _id: 'rec_5',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            courseCode: 'CS-302',
            courseName: 'Database Architecture',
            status: 'Late',
            notes: 'Arrived 10 minutes late due to traffic'
          },
          {
            _id: 'rec_6',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
            courseCode: 'CS-303',
            courseName: 'Artificial Intelligence',
            status: 'Present',
            notes: 'Neural Networks introductory lecture'
          },
          {
            _id: 'rec_7',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
            courseCode: 'CS-301',
            courseName: 'Advanced Web Engineering',
            status: 'Present',
            notes: 'Node.js routing assignments review'
          },
          {
            _id: 'rec_8',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            courseCode: 'CS-302',
            courseName: 'Database Architecture',
            status: 'Absent',
            notes: 'Unexcused absence'
          },
          {
            _id: 'rec_9',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), // 8 days ago
            courseCode: 'CS-303',
            courseName: 'Artificial Intelligence',
            status: 'Present',
            notes: 'Search algorithms presentation'
          },
          {
            _id: 'rec_10',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(), // 9 days ago
            courseCode: 'CS-301',
            courseName: 'Advanced Web Engineering',
            status: 'Present',
            notes: 'Redux State Management demo'
          }
        ];

        fetchedSummaries = [
          {
            courseId: 'c1',
            courseCode: 'CS-301',
            courseName: 'Advanced Web Engineering',
            total: 20,
            present: 18,
            absent: 1,
            late: 1,
            percentage: 90,
            classesNeededTo85: 0
          },
          {
            courseId: 'c2',
            courseCode: 'CS-302',
            courseName: 'Database Architecture',
            total: 20,
            present: 15,
            absent: 3,
            late: 2,
            percentage: 75,
            classesNeededTo85: 4
          },
          {
            courseId: 'c3',
            courseCode: 'CS-303',
            courseName: 'Artificial Intelligence',
            total: 16,
            present: 15,
            absent: 1,
            late: 0,
            percentage: 93,
            classesNeededTo85: 0
          }
        ];
      }

      setRecords(fetchedRecords);
      setCourseSummaries(fetchedSummaries);

      if (fetchedSummaries.length > 0) {
        setCalcCourse(fetchedSummaries[0].courseCode);
      }

      if (user.role === 'faculty') {
        // Mock list of courses for faculty selection
        const coursesList = [
          { id: 'course_01', name: 'Advanced Web Engineering', code: 'CS-301' },
          { id: 'course_02', name: 'Database Architecture', code: 'CS-302' },
          { id: 'course_03', name: 'Artificial Intelligence', code: 'CS-303' }
        ];
        setSelectedCourse(coursesList[0].id);
        
        // Load roster for course
        setStudents([
          { id: 'user_student_01', name: 'Aravind Sharma', rollNo: 'CS-2023-042' },
          { id: 'user_student_02', name: 'Neha Singhal', rollNo: 'CS-2023-045' },
          { id: 'user_student_03', name: 'Rohan Mehta', rollNo: 'CS-2023-050' },
          { id: 'user_student_04', name: 'Divya Nair', rollNo: 'CS-2023-053' },
          { id: 'user_student_05', name: 'Siddharth Roy', rollNo: 'CS-2023-061' }
        ]);
        
        // Initialize attendance sheet
        setAttendanceSheet({
          'user_student_01': 'Present',
          'user_student_02': 'Present',
          'user_student_03': 'Present',
          'user_student_04': 'Present',
          'user_student_05': 'Present'
        });
      }
    } catch (err) {
      console.error('Failed to load attendance logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkStatus = (studentId, status) => {
    setAttendanceSheet(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    setSubmitLoading(true);
    setSuccessMsg('');
    try {
      // Post attendance records sequentially for students in sheet
      for (const studentId of Object.keys(attendanceSheet)) {
        await attendanceAPI.post({
          studentId,
          courseId: selectedCourse,
          status: attendanceSheet[studentId],
          date: new Date(),
          notes: 'Daily faculty roll-call log'
        });
      }
      setSuccessMsg('Attendance sheet logged successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchAttendanceData();
    } catch (err) {
      console.error('Submit sheet failed:', err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="list" count={4} />;
  }

  // Calculate Overall Aggregate
  const totalClasses = courseSummaries.reduce((sum, c) => sum + c.total, 0);
  const totalPresent = courseSummaries.reduce((sum, c) => sum + (c.present + (c.late * 0.5)), 0); // Late counts as half
  const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

  // Filters mapping
  const filteredRecords = records.filter(r => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Present') return r.status === 'Present';
    if (selectedFilter === 'Absent') return r.status === 'Absent';
    if (selectedFilter === 'Late') return r.status === 'Late';
    return r.courseCode === selectedFilter;
  });

  // Calculator Helper
  const getCalculatorMetrics = () => {
    const target = courseSummaries.find(c => c.courseCode === calcCourse);
    if (!target) return null;
    const projectedTotal = target.total + parseInt(extraAbsences || 0);
    const projectedPresent = target.present + (target.late * 0.5); // stays same since extra classes are absences
    const projectedPercentage = projectedTotal > 0 ? Math.round((projectedPresent / projectedTotal) * 100) : 0;
    return {
      percentage: projectedPercentage,
      willBeSafe: projectedPercentage >= 85
    };
  };
  const calcResult = getCalculatorMetrics();

  // Student Attendance View Layout
  if (user.role === 'student') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 select-none">
        
        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-xs text-zinc-300">
                You are viewing <strong>demo logs</strong> to showcase the attendance tracker. Adding live faculty logs will replace this view.
              </span>
            </div>
            <button 
              onClick={() => setIsDemoMode(false)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-wider font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Overall Meter */}
          <GlassCard className="p-5 flex flex-col justify-between items-center text-center">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Overall Attendance</span>
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" className="stroke-zinc-800/60" strokeWidth="6.5" fill="transparent" />
                  <circle
                    cx="48" cy="48" r="40"
                    className={`${
                      overallPercentage >= 85 ? 'stroke-emerald-500' : 'stroke-rose-500'
                    } transition-all duration-1000`}
                    strokeWidth="6.5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - overallPercentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-extrabold text-zinc-100">{overallPercentage}%</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Aggregate</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/40 px-3 py-1.5 rounded-lg">
              {overallPercentage >= 85 ? (
                <>
                  <CheckCircle size={13} className="text-emerald-400" />
                  <span className="text-emerald-400/90 font-medium">Safe from shortage</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={13} className="text-rose-500" />
                  <span className="text-rose-400/90 font-medium">Shortage Threshold Triggered</span>
                </>
              )}
            </div>
          </GlassCard>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:col-span-2 gap-4">
            <GlassCard className="p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Present Classes</span>
                <h3 className="text-2xl font-bold text-emerald-400">
                  {courseSummaries.reduce((sum, c) => sum + c.present, 0)}
                  <span className="text-xs text-zinc-500 font-medium ml-1">sessions</span>
                </h3>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2">Consistent presence keeps your internal assessment scores high.</p>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Late Arrivals</span>
                <h3 className="text-2xl font-bold text-amber-400">
                  {courseSummaries.reduce((sum, c) => sum + c.late, 0)}
                  <span className="text-xs text-zinc-500 font-medium ml-1">times</span>
                </h3>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2">Note: Three late arrivals are treated as one full absence.</p>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Total Absences</span>
                <h3 className="text-2xl font-bold text-rose-400">
                  {courseSummaries.reduce((sum, c) => sum + c.absent, 0)}
                  <span className="text-xs text-zinc-500 font-medium ml-1">days</span>
                </h3>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2">Maintain strict buffer check to avoid semester registration locks.</p>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Enrolled Courses</span>
                <h3 className="text-2xl font-bold text-blue-400">
                  {courseSummaries.length}
                  <span className="text-xs text-zinc-500 font-medium ml-1">subjects</span>
                </h3>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2">Registering 100% check across all current lecture paths.</p>
            </GlassCard>
          </div>

          {/* Absence Predictor Widget */}
          <GlassCard className="p-5 flex flex-col justify-between border-l-2 border-l-blue-500">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Calculator size={14} className="text-blue-400" />
                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">Absence Impact Estimator</span>
              </div>
              
              <div className="space-y-3 mt-3">
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Course Code</label>
                  <select 
                    value={calcCourse}
                    onChange={(e) => setCalcCourse(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-2 py-1.5 text-xs text-zinc-300 focus:outline-none"
                  >
                    {courseSummaries.map((c) => (
                      <option key={c.courseCode} value={c.courseCode}>{c.courseCode}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Planned Absences</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      min="0"
                      max="10"
                      value={extraAbsences}
                      onChange={(e) => setExtraAbsences(parseInt(e.target.value) || 0)}
                      className="w-16 bg-zinc-900/60 border border-zinc-850 rounded-xl px-2.5 py-1 text-center text-xs text-zinc-200 focus:outline-none"
                    />
                    <span className="text-xs text-zinc-400">classes</span>
                  </div>
                </div>
              </div>
            </div>

            {calcResult && (
              <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Estimated:</span>
                <span className={`font-bold ${calcResult.willBeSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {calcResult.percentage}% ({calcResult.willBeSafe ? 'Safe' : 'Shortage'})
                </span>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Attendance Course Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courseSummaries.map((c) => (
            <GlassCard key={c.courseId} hoverEffect={true} className="flex flex-col justify-between border-t border-t-zinc-800">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {c.courseCode}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    c.percentage < 85 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {c.percentage}% Attendance
                  </span>
                </div>
                <h4 className="font-semibold text-zinc-100 text-sm mt-3">{c.courseName}</h4>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2 rounded-lg bg-zinc-900/30 text-xs">
                    <span className="text-zinc-500 block">Total</span>
                    <span className="font-semibold text-zinc-200 mt-0.5 block">{c.total}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/30 text-xs">
                    <span className="text-emerald-500/80 block">Present</span>
                    <span className="font-semibold text-emerald-400 mt-0.5 block">{c.present}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/30 text-xs">
                    <span className="text-rose-500/80 block">Absent</span>
                    <span className="font-semibold text-rose-400 mt-0.5 block">{c.absent}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Calculator Target helper */}
              <div className="mt-4 pt-3 border-t border-zinc-800/60">
                {c.percentage >= 85 ? (
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 leading-relaxed">
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" /> Academic requirements met (85% target). Safe to miss classes.
                  </p>
                ) : (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1.5 leading-relaxed">
                    <AlertTriangle size={14} className="text-rose-500 flex-shrink-0" /> Target Alert: You must attend the next <strong>{c.classesNeededTo85}</strong> consecutive classes to regain 85% eligibility.
                  </p>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* History Log Section */}
        <GlassCard hoverEffect={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-850">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-accent-primary" />
              <h3 className="font-semibold text-base text-zinc-200">Daily Attendance History Logs</h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950/60 p-1 rounded-xl border border-zinc-850">
              {['All', 'Present', 'Absent', 'Late', ...courseSummaries.map(c => c.courseCode)].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setSelectedFilter(filterOption)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    selectedFilter === filterOption
                      ? 'bg-zinc-850 text-zinc-100 border border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 uppercase font-semibold">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Course Code</th>
                  <th className="py-3 px-2">Subject Name</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Notes / Activity details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs">
                      No records match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r._id} className="hover:bg-zinc-900/10 transition-colors">
                      <td className="py-3.5 px-2 font-medium">
                        {new Date(r.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="font-bold text-[10px] text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-2 py-0.5 rounded-lg">
                          {r.courseCode || r.course?.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-zinc-400">{r.courseName || r.course?.name}</td>
                      <td className="py-3.5 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'Present' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5 shadow-sm' 
                            : r.status === 'Late' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-amber-500/5 shadow-sm' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-rose-500/5 shadow-sm'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-zinc-500 italic max-w-xs truncate">{r.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Faculty Attendance View Layout
  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none max-w-4xl mx-auto w-full">
      <GlassCard hoverEffect={false}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800/80">
          <div>
            <h3 className="font-semibold text-base text-zinc-200 flex items-center gap-1.5">
              <UserCheck size={18} className="text-accent-primary" /> Post Course Attendance Sheet
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Select course registry and record daily attendance roster</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-zinc-500" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="course_01">CS-301 Advanced Web Engineering</option>
              <option value="course_02">CS-302 Database Architecture</option>
              <option value="course_03">CS-303 Artificial Intelligence</option>
            </select>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl mb-4 flex items-center gap-2 animate-in fade-in">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* Student Roster list */}
        <div className="space-y-3">
          {students.map((student) => (
            <div 
              key={student.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50 gap-4 hover:border-zinc-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-zinc-850 border border-zinc-750 flex items-center justify-center font-bold text-zinc-350 text-xs">
                  {student.name[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200 text-sm">{student.name}</h4>
                  <span className="text-[11px] text-zinc-500">Roll No: {student.rollNo}</span>
                </div>
              </div>

              {/* Attendance Status Picker */}
              <div className="flex gap-2">
                {['Present', 'Absent', 'Late'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleMarkStatus(student.id, status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      attendanceSheet[student.id] === status
                        ? status === 'Present'
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-glow'
                          : status === 'Late'
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-glow'
                            : 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-glow'
                        : 'bg-zinc-950/60 border-zinc-850 text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex justify-end">
          <button
            onClick={handleSubmitAttendance}
            disabled={submitLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-90 active:scale-95 text-xs text-white font-semibold rounded-xl shadow-glow transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitLoading ? (
              <div className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check size={14} /> Submit Attendance Sheet
              </>
            )}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default Attendance;

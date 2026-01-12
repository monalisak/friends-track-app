import { Calendar, MapPin, Users, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Friends Logistics</h1>
        <p className="text-gray-600 mt-1">Stay connected with your group</p>
      </header>

      {/* Next Meetup Card */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Next Meetup</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Weekly Coffee Catchup</h3>
              <div className="flex items-center text-gray-600 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-sm">Sat, Dec 21 • 10:00 AM</span>
              </div>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">Starbucks Downtown</span>
              </div>
            </div>
            <div className="flex items-center text-sm text-blue-600">
              <Users className="w-4 h-4 mr-1" />
              <span>8 going</span>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Meetups */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Meetups</h2>
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <h3 className="font-medium text-gray-900">New Year Party</h3>
            <p className="text-sm text-gray-600">Fri, Dec 27 • 8:00 PM</p>
            <p className="text-sm text-gray-600">Mike's House</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <h3 className="font-medium text-gray-900">Hiking Trip</h3>
            <p className="text-sm text-gray-600">Sun, Dec 29 • 9:00 AM</p>
            <p className="text-sm text-gray-600">Mountain Trail</p>
          </div>
        </div>
      </section>

      {/* Upcoming Trips */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Trips</h2>
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Japan Ski Trip</h3>
                <p className="text-sm text-gray-600">Feb 15-22, 2026</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Booked
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Summer Beach Vacation</h3>
                <p className="text-sm text-gray-600">Jun 1-7, 2026</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Planning
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Who's Away */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Who's Away Soon</h2>
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Sarah</p>
                <p className="text-sm text-gray-600">Business trip</p>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">Dec 20-22</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Mike</p>
                <p className="text-sm text-gray-600">Family visit</p>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">Dec 25-27</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

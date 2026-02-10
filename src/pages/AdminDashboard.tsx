import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import kovaLogo from "@/assets/kova-logo.png";
import {
  Eye,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Lead {
  id: string;
  business_name: string;
  city: string;
  state: string;
  industries: string[];
  core_services: string | null;
  business_description: string | null;
  logo_url: string | null;
  notes: string | null;
  status: string;
  follow_up_notes: string | null;
  created_at: string;
}

interface Preview {
  id: string;
  lead_id: string;
  brand_positioning: string | null;
  copy_direction: string | null;
  hero_headline: string | null;
  ai_notes: string | null;
  perplexity_research: string | null;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400",
  preview_sent: "bg-kova-gold/20 text-kova-gold",
  consult_booked: "bg-green-500/20 text-green-400",
  installed: "bg-purple-500/20 text-purple-400",
  retainer_active: "bg-emerald-500/20 text-emerald-400",
};

const statusLabels: Record<string, string> = {
  new: "New",
  preview_sent: "Preview Sent",
  consult_booked: "Consult Booked",
  installed: "Installed",
  retainer_active: "Retainer Active",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [previews, setPreviews] = useState<Record<string, Preview>>({});
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate("/admin/login");
      return;
    }

    const { data: leadsData } = await supabase
      .from("business_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (leadsData) {
      setLeads(leadsData as unknown as Lead[]);

      // Fetch previews for all leads
      const leadIds = leadsData.map((l: any) => l.id);
      if (leadIds.length > 0) {
        const { data: previewsData } = await supabase
          .from("generated_previews")
          .select("*")
          .in("lead_id", leadIds);

        if (previewsData) {
          const map: Record<string, Preview> = {};
          (previewsData as unknown as Preview[]).forEach((p) => {
            map[p.lead_id] = p;
          });
          setPreviews(map);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/admin/login");
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const updateStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from("business_leads")
      .update({ status: newStatus })
      .eq("id", leadId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    }
  };

  const updateFollowUp = async (leadId: string, notes: string) => {
    const { error } = await supabase
      .from("business_leads")
      .update({ follow_up_notes: notes })
      .eq("id", leadId);
    if (error) toast.error("Failed to save notes");
    else toast.success("Notes saved");
  };

  const regeneratePreview = async (leadId: string) => {
    toast.info("Regenerating preview...");
    const { error } = await supabase.functions.invoke("generate-preview", {
      body: { lead_id: leadId },
    });
    if (error) toast.error("Failed to regenerate");
    else toast.success("Preview regeneration started");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-kova-chrome/20 bg-kova-surface/50">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={kovaLogo} alt="Kova" className="h-8" />
            </Link>
            <span className="text-xs tracking-widest uppercase text-muted-foreground">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="chrome" size="sm" onClick={fetchData}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Object.entries(statusLabels).map(([key, label]) => {
            const count = leads.filter((l) => l.status === key).length;
            return (
              <div key={key} className="glass-surface metallic-border rounded-sm p-4 text-center">
                <p className="text-2xl font-display gradient-gold-text">{count}</p>
                <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Leads List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No leads yet.</div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => {
              const preview = previews[lead.id];
              const isExpanded = expandedLead === lead.id;

              return (
                <div
                  key={lead.id}
                  className="glass-surface metallic-border rounded-sm overflow-hidden"
                >
                  {/* Lead Row */}
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-kova-surface-elevated/50 transition-colors"
                    onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                  >
                    {lead.logo_url && (
                      <img src={lead.logo_url} alt="" className="w-8 h-8 rounded-sm object-contain bg-kova-surface" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm tracking-wide truncate">{lead.business_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {lead.city}, {lead.state} · {(lead.industries || []).join(", ")}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm text-xs tracking-wider uppercase ${statusColors[lead.status] || ""}`}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-kova-chrome/10 p-6 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Lead Details */}
                        <div className="space-y-3">
                          <h4 className="text-xs tracking-widest uppercase text-kova-gold">Lead Details</h4>
                          {lead.core_services && (
                            <p className="text-sm text-muted-foreground">
                              <span className="text-foreground">Services:</span> {lead.core_services}
                            </p>
                          )}
                          {lead.business_description && (
                            <p className="text-sm text-muted-foreground">
                              <span className="text-foreground">Description:</span> {lead.business_description}
                            </p>
                          )}
                          {lead.notes && (
                            <p className="text-sm text-muted-foreground">
                              <span className="text-foreground">Notes:</span> {lead.notes}
                            </p>
                          )}
                        </div>

                        {/* AI Notes */}
                        {preview && (
                          <div className="space-y-3">
                            <h4 className="text-xs tracking-widest uppercase text-kova-gold">AI Analysis</h4>
                            {preview.brand_positioning && (
                              <p className="text-sm text-muted-foreground">
                                <span className="text-foreground">Positioning:</span> {preview.brand_positioning}
                              </p>
                            )}
                            {preview.ai_notes && (
                              <p className="text-sm text-muted-foreground">
                                <span className="text-foreground">Kova Notes:</span> {preview.ai_notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Perplexity Research */}
                      {preview?.perplexity_research && (
                        <div className="space-y-2">
                          <h4 className="text-xs tracking-widest uppercase text-kova-gold">Market Research</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {preview.perplexity_research}
                          </p>
                        </div>
                      )}

                      {/* Status + Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className="bg-kova-surface border border-kova-chrome/20 rounded-sm px-3 py-1.5 text-xs tracking-wider text-foreground"
                        >
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>

                        {preview && preview.status === "ready" && (
                          <Button variant="gold-outline" size="sm" asChild>
                            <Link to={`/preview/${lead.id}`} target="_blank">
                              <Eye className="w-3.5 h-3.5 mr-1.5" /> View Preview
                            </Link>
                          </Button>
                        )}

                        <Button variant="chrome" size="sm" onClick={() => regeneratePreview(lead.id)}>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Regenerate
                        </Button>

                        <Button variant="gold-outline" size="sm" asChild>
                          <a
                            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Kova+Build+Review+-+${encodeURIComponent(lead.business_name)}&details=${encodeURIComponent(`Build review for ${lead.business_name}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Schedule
                          </a>
                        </Button>
                      </div>

                      {/* Follow-up Notes */}
                      <div className="space-y-2">
                        <h4 className="text-xs tracking-widest uppercase text-kova-gold">Follow-Up Notes</h4>
                        <Textarea
                          defaultValue={lead.follow_up_notes || ""}
                          placeholder="Internal notes about this lead..."
                          rows={3}
                          className="bg-kova-surface border-kova-chrome/20 text-foreground placeholder:text-muted-foreground/50 resize-none text-sm"
                          onBlur={(e) => updateFollowUp(lead.id, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

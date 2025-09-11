export default class EventModel {
  constructor(data) {
    this.id = data?.id ?? "";
    this.name = data?.event_name ?? "Untitled Event";
    this.venue = data?.event_venue ?? "-";
    this.desc = data?.event_desc ?? "";
    this.startDate = data?.event_start_date ?? "";
    this.endDate = data?.event_end_date ?? "";
    this.organisedBy = data?.event_organised_by ?? "-";
    this.pic = data?.event_pic ?? null;
    this.headerImg = data?.event_header_img ?? null;
    this.footerImg = data?.event_footer_img ?? null;
    this.createdDate = data?.created_date ?? "";
    this.modifyDate = data?.modify_date ?? "";
    this.isDeleted = data?.is_deleted === "1";

    // Derived property
    this.isCompleted = this.checkIfCompleted();
  }

  checkIfCompleted() {
    if (!this.endDate) return false;
    const now = new Date();
    const end = new Date(this.endDate.replace(" ", "T")); // fix format
    return end < now;
  }
}

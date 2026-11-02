import '../../../data/reports_store.dart';
import '../../../models/pothole_report.dart';

/// Service coordinating Citizen pothole reporting workflows and queries.
class CitizenReportsService {
  static final CitizenReportsService instance =
      CitizenReportsService._internal();

  CitizenReportsService._internal();

  ReportsStore get _store => ReportsStore.instance;

  List<PotholeReport> get citizenReports => _store.allReports;

  PotholeReport? getReport(String id) => _store.getReportById(id);

  void submitReport(PotholeReport report) {
    _store.addReport(report);
  }

  bool cancelReport(String id, [String reason = 'Cancelled by citizen']) {
    return _store.cancelReport(id, reason);
  }
}

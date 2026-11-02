import 'package:flutter/material.dart';

/// A round pushpin marker widget for maps.
///
/// Features a round head with a white center dot, drop shadow,
/// high-contrast white outline, and bottom tip pointing at the map coordinates.
class RoundPushpinMarker extends StatelessWidget {
  const RoundPushpinMarker({
    super.key,
    required this.color,
    this.size = 36.0,
    this.isSelected = false,
    this.child,
  });

  final Color color;
  final double size;
  final bool isSelected;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final effectiveSize = isSelected ? size * 1.18 : size;
    final totalHeight = effectiveSize * 1.2;

    return SizedBox(
      width: effectiveSize + 6,
      height: totalHeight,
      child: Stack(
        alignment: Alignment.topCenter,
        clipBehavior: Clip.none,
        children: [
          // White outline with shadow behind the pushpin for visibility on all map tiles
          Positioned(
            top: 0,
            child: Icon(
              Icons.location_on_rounded,
              size: effectiveSize + 5,
              color: Colors.white,
              shadows: const [
                BoxShadow(
                  color: Color(0x40000000),
                  blurRadius: 5,
                  offset: Offset(0, 3),
                ),
              ],
            ),
          ),
          // Main colored round pushpin
          Positioned(
            top: 2.5,
            child: Icon(
              Icons.location_on_rounded,
              size: effectiveSize,
              color: color,
            ),
          ),
          // Inner circular core in the round head
          Positioned(
            top: 2.5 + effectiveSize * 0.16,
            child: child ??
                Container(
                  width: effectiveSize * 0.34,
                  height: effectiveSize * 0.34,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x2E000000),
                        blurRadius: 1.5,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                  child: isSelected
                      ? Center(
                          child: Icon(
                            Icons.check,
                            size: effectiveSize * 0.24,
                            color: color,
                          ),
                        )
                      : null,
                ),
          ),
        ],
      ),
    );
  }
}
